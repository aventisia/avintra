using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System.Net.Http.Headers;

namespace AccountsAPIs.Services;

public partial class LoginWithExternalAuthService
{
    private const string GoogleAuthorizeEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string GoogleTokenEndpoint = "https://oauth2.googleapis.com/token";
    private const string GoogleDiscoveryDocument = "https://accounts.google.com/.well-known/openid-configuration";
    private const string GoogleLoginScope = "openid email profile";
    private const string GitHubAuthorizeEndpoint = "https://github.com/login/oauth/authorize";
    private const string GitHubTokenEndpoint = "https://github.com/login/oauth/access_token";
    private const string GitHubUserEndpoint = "https://api.github.com/user";
    private const string GitHubEmailsEndpoint = "https://api.github.com/user/emails";
    private const string GitHubLoginScope = "user:email";
    private const string GitHubUserAgent = "Avintra-Accounts";
    private const string SocialLinkCachePrefix = "social-link:";
    private const int SocialLinkMaxFailedAttempts = 5;

    private static readonly ConfigurationManager<OpenIdConnectConfiguration> GoogleConfigurationManager =
        new(GoogleDiscoveryDocument, new OpenIdConnectConfigurationRetriever(), new HttpDocumentRetriever());

    // Generates a Google or GitHub authorization URL and binds the attempt to the calling browser.
    public ServiceResponse<string> GenerateSocialLoginUrl(ExternalAuthProviderEnum provider, string? redirectUrl, bool hasPlanIntent)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Failed to generate the sign-in URL. Please try again."
        };

        if (_environmentConfig.OnPremLoginDisabled)
        {
            serviceResponse.StatusCode = 403;
            serviceResponse.Message = SocialAuthHelpers.LoginDisabledMessage;
            return serviceResponse;
        }

        var providerName = SocialAuthHelpers.GetProviderName(provider);
        // IMPORTANT NOTE: explicit allowlist mirrors GetProviderName so CodeQL sees only Google/GitHub reach the URL builders below.
        if (providerName == null || (provider != ExternalAuthProviderEnum.Google && provider != ExternalAuthProviderEnum.GitHub) || !SocialAuthHelpers.IsSocialOffered(_environmentConfig))
        {
            serviceResponse.StatusCode = 400;
            serviceResponse.Message = "Unsupported authentication provider.";
            return serviceResponse;
        }

        if (!string.IsNullOrWhiteSpace(redirectUrl) && !SocialAuthHelpers.IsSameOriginPath(redirectUrl))
        {
            serviceResponse.StatusCode = 400;
            serviceResponse.Message = "The redirect URL is not allowed.";
            return serviceResponse;
        }

        if (!SocialAuthHelpers.IsSocialConfigured(_environmentConfig, provider))
        {
            serviceResponse.StatusCode = 400;
            serviceResponse.Message = SocialAuthHelpers.NotConfiguredMessage;
            return serviceResponse;
        }

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            serviceResponse.StatusCode = 500;
            return serviceResponse;
        }

        var state = SocialAuthHelpers.GenerateSocialState();
        var nonce = SocialAuthHelpers.GenerateOpaqueValue();
        var codeVerifier = SocialAuthHelpers.GenerateCodeVerifier();
        var bindingValue = SocialAuthHelpers.GenerateOpaqueValue();
        var userAgent = httpContext.Request.Headers.UserAgent.ToString();
        var redirectUri = BuildSocialRedirectUrl();

        _authStateCache.SetString(
            BuildAuthStateCacheKey(state),
            JsonSerializer.Serialize(new SsoAuthStateDto
            {
                Nonce = nonce,
                Provider = providerName,
                CodeVerifier = codeVerifier,
                BindingHash = SocialAuthHelpers.GenerateBindingHash(bindingValue, userAgent),
                ReturnUrl = string.IsNullOrWhiteSpace(redirectUrl) ? null : redirectUrl,
                HasPlanIntent = hasPlanIntent
            }),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = AuthStateTtl });

        httpContext.Response.Cookies.Append(SocialAuthHelpers.GetBindingCookieName(state), bindingValue, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/",
            IsEssential = true,
            Expires = DateTimeOffset.UtcNow.Add(AuthStateTtl)
        });

        serviceResponse.Data = provider == ExternalAuthProviderEnum.Google
            ? BuildGoogleAuthorizeUrl(_environmentConfig.GoogleOAuthClientId, redirectUri, state, nonce,
                SocialAuthHelpers.GenerateCodeChallenge(codeVerifier))
            : BuildGitHubAuthorizeUrl(_environmentConfig.GitHubOAuthClientId, redirectUri, state,
                SocialAuthHelpers.GenerateCodeChallenge(codeVerifier));
        serviceResponse.StatusCode = 200;
        serviceResponse.Message = "Sign-in URL generated successfully.";

        return serviceResponse;
    }

    // Resolves the social provider identity of an authorization code into the next sign-in step.
    public async Task<ServiceResponse<SocialSignInResultDto>> SocialCallbackAsync(string code, string? state)
    {
        if (_environmentConfig.OnPremLoginDisabled)
            return ServiceResponse<SocialSignInResultDto>.Create(SocialAuthHelpers.LoginDisabledMessage, 403);

        if (string.IsNullOrWhiteSpace(code))
            return ServiceResponse<SocialSignInResultDto>.Create("Authorization code is missing.", 400);

        var authState = ConsumeAuthState(state);
        if (authState == null)
            return ServiceResponse<SocialSignInResultDto>.Create("Invalid or expired sign-in attempt.", 400);

        var provider = SocialAuthHelpers.ParseProvider(authState.Provider);
        if (provider == null || !SocialAuthHelpers.IsSocialOffered(_environmentConfig))
            return ServiceResponse<SocialSignInResultDto>.Create("Invalid or expired sign-in attempt.", 400);

        if (!SocialAuthHelpers.IsSocialConfigured(_environmentConfig, provider))
            return ServiceResponse<SocialSignInResultDto>.Create(SocialAuthHelpers.NotConfiguredMessage, 400);

        if (!IsBindingValid(authState, state!))
        {
            _logger.LogWarning("Social sign-in rejected because the browser binding did not match the authorization attempt.");
            return ServiceResponse<SocialSignInResultDto>.Create("Invalid or expired sign-in attempt.", 400);
        }

        ClearBindingCookie(state!);

        var identityResult = provider == ExternalAuthProviderEnum.Google
            ? await ExchangeGoogleCodeAsync(code, authState)
            : await ExchangeGitHubCodeAsync(code, authState);

        if (identityResult.StatusCode != 200 || identityResult.Data == null)
            return ServiceResponse<SocialSignInResultDto>.Create(identityResult.Message ?? "Failed to sign you in. Please try again.", identityResult.StatusCode);

        return await ResolveSocialIdentityAsync(provider.Value, identityResult.Data, authState);
    }

    // Confirms the one-time code that links a social provider account to an existing account.
    public async Task<ServiceResponse<SocialSignInResultDto>> VerifySocialLinkAsync(SocialLinkVerifyDto socialLinkVerifyDto)
    {
        if (_environmentConfig.OnPremLoginDisabled)
            return ServiceResponse<SocialSignInResultDto>.Create(SocialAuthHelpers.LoginDisabledMessage, 403);

        if (!SocialAuthHelpers.IsSocialOffered(_environmentConfig))
            return ServiceResponse<SocialSignInResultDto>.Create("Invalid or expired sign-in attempt.", 400);

        var pendingLink = await GetSocialLinkChallengeAsync(socialLinkVerifyDto.VerificationCodeId);
        if (pendingLink == null)
            return ServiceResponse<SocialSignInResultDto>.Create("This sign-in attempt has expired. Please try again.", 400);

        var provider = SocialAuthHelpers.ParseProvider(pendingLink.Provider);
        if (provider == null)
            return ServiceResponse<SocialSignInResultDto>.Create("Invalid or expired sign-in attempt.", 400);

        var verificationCode = await _unitOfWork.VerificationCodeRepo
            .GetByConditionAsync(w =>
                w.Id == socialLinkVerifyDto.VerificationCodeId &&
                w.RequestType == VerificationCodeRequestTypesEnum.LinkSocialLogin &&
                w.Email == pendingLink.Email)
            .SingleOrDefaultAsync();

        if (verificationCode == null || verificationCode.ExpiresOn <= DateTimeOffset.UtcNow)
        {
            await _authStateCache.RemoveAsync($"{SocialLinkCachePrefix}{socialLinkVerifyDto.VerificationCodeId}");
            return ServiceResponse<SocialSignInResultDto>.Create("This sign-in attempt has expired. Please try again.", 400);
        }

        if (verificationCode.SecretCode != socialLinkVerifyDto.SecretCode)
        {
            // IMPORTANT NOTE: the attempt count lives in the cached challenge so a resend cannot raise the cap.
            pendingLink.FailedAttempts++;
            if (pendingLink.FailedAttempts >= SocialLinkMaxFailedAttempts)
            {
                await DeleteSocialLinkChallengeAsync(verificationCode);
                return ServiceResponse<SocialSignInResultDto>.Create("This sign-in attempt has expired. Please try again.", 400);
            }

            await StoreSocialLinkChallengeAsync(socialLinkVerifyDto.VerificationCodeId, pendingLink);
            return ServiceResponse<SocialSignInResultDto>.Create("Failed to verify the code. Please try again.", 400);
        }

        // IMPORTANT NOTE: the code is single use, so it is deleted before the identity is linked.
        _unitOfWork.VerificationCodeRepo.Delete(verificationCode);
        if (!await _unitOfWork.SaveAsync())
            return ServiceResponse<SocialSignInResultDto>.Create("Failed to verify the code. Please try again.", 400);

        await _authStateCache.RemoveAsync($"{SocialLinkCachePrefix}{socialLinkVerifyDto.VerificationCodeId}");

        var user = await _userManager.FindByEmailAsync(pendingLink.Email);
        if (user == null)
            return ServiceResponse<SocialSignInResultDto>.Create("Invalid credentials", 401);

        var authState = new SsoAuthStateDto
        {
            Provider = pendingLink.Provider,
            ReturnUrl = pendingLink.ReturnUrl,
            HasPlanIntent = pendingLink.HasPlanIntent
        };

        return await ContinueExistingUserAsync(user, provider.Value, pendingLink.ProviderKey, pendingLink.Email, authState, true);
    }

    // Prepares the resend of the outstanding two-step or account-link code of a social attempt.
    public async Task<ServiceResponse<SocialSignInResultDto>> PrepareSocialChallengeResendAsync(Guid verificationCodeId, string email, string provider)
    {
        if (_environmentConfig.OnPremLoginDisabled)
            return ServiceResponse<SocialSignInResultDto>.Create(SocialAuthHelpers.LoginDisabledMessage, 403);

        if (!SocialAuthHelpers.IsSocialOffered(_environmentConfig))
            return ServiceResponse<SocialSignInResultDto>.Create("Invalid or expired sign-in attempt.", 400);

        var parsedProvider = SocialAuthHelpers.ParseProvider(provider);
        if (parsedProvider == null)
            return ServiceResponse<SocialSignInResultDto>.Create("Unsupported authentication provider.", 400);

        var providerName = SocialAuthHelpers.GetProviderName(parsedProvider.Value)!;

        var verificationCode = await _unitOfWork.VerificationCodeRepo
            .GetByConditionAsync(w => w.Id == verificationCodeId && w.Email == email)
            .SingleOrDefaultAsync();

        if (verificationCode == null)
            return ServiceResponse<SocialSignInResultDto>.Create("This sign-in attempt has expired. Please try again.", 400);

        if (verificationCode.RequestType == VerificationCodeRequestTypesEnum.LinkSocialLogin)
        {
            var pendingLink = await GetSocialLinkChallengeAsync(verificationCodeId);

            // IMPORTANT NOTE: the attempt count survives a resend, so a resend never grants fresh guesses.
            if (pendingLink == null || pendingLink.FailedAttempts >= SocialLinkMaxFailedAttempts)
            {
                await DeleteSocialLinkChallengeAsync(verificationCode);
                return ServiceResponse<SocialSignInResultDto>.Create("This sign-in attempt has expired. Please try again.", 400);
            }

            return ServiceResponse<SocialSignInResultDto>.Create("Link code must be reissued.", 200, new SocialSignInResultDto
            {
                Outcome = SocialSignInOutcomeEnum.LinkCodeRequired,
                Provider = pendingLink.Provider,
                Email = pendingLink.Email,
                ProviderKey = pendingLink.ProviderKey,
                ReturnUrl = pendingLink.ReturnUrl,
                HasPlanIntent = pendingLink.HasPlanIntent,
                FailedAttempts = pendingLink.FailedAttempts
            });
        }

        if (verificationCode.RequestType != VerificationCodeRequestTypesEnum.TwoFA)
            return ServiceResponse<SocialSignInResultDto>.Create("This sign-in attempt has expired. Please try again.", 400);

        return ServiceResponse<SocialSignInResultDto>.Create("Two-step code must be reissued.", 200, new SocialSignInResultDto
        {
            Outcome = SocialSignInOutcomeEnum.TwoFARequired,
            Provider = providerName,
            Email = email
        });
    }

    // Holds the provider identity while the one-time link confirmation code is outstanding.
    public async Task StoreSocialLinkChallengeAsync(Guid verificationCodeId, SocialLinkChallengeDto socialLinkChallengeDto)
    {
        await _authStateCache.SetStringAsync(
            $"{SocialLinkCachePrefix}{verificationCodeId}",
            JsonSerializer.Serialize(socialLinkChallengeDto),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_environmentConfig.OtpValidityInMinutes)
            });
    }

    private async Task<ServiceResponse<SocialSignInResultDto>> ResolveSocialIdentityAsync(
        ExternalAuthProviderEnum provider, SocialIdentity identity, SsoAuthStateDto authState)
    {
        var providerName = SocialAuthHelpers.GetProviderName(provider)!;

        var ssoByDomain = await ResolveSsoTenantByDomainAsync(identity.Email);
        if (ssoByDomain != null && SsoConfigHelpers.IsSsoOfferedForTenant(
                ssoByDomain, _environmentConfig.IsSsoAllowedForDeployment, _environmentConfig.MicrosoftSsoEnabled))
            return BuildSsoRequiredResult(providerName, ssoByDomain, identity.Email, authState);

        var linkedUser = await _userManager.FindByLoginAsync(providerName, identity.ProviderKey);
        if (linkedUser != null)
            return await ContinueExistingUserAsync(linkedUser, provider, identity.ProviderKey, identity.Email, authState, false);

        var emailUser = await _userManager.FindByEmailAsync(identity.Email);
        if (emailUser != null)
            return await ContinueExistingUserAsync(emailUser, provider, identity.ProviderKey, identity.Email, authState, false, identity.IsProviderOwnedMailbox);

        return await CreateSocialAccountAsync(provider, identity, authState);
    }

    private async Task<ServiceResponse<SocialSignInResultDto>> ContinueExistingUserAsync(
        AccountUser user, ExternalAuthProviderEnum provider, string providerKey, string email, SsoAuthStateDto authState,
        bool isLinkVerified, bool isProviderOwnedMailbox = false)
    {
        var providerName = SocialAuthHelpers.GetProviderName(provider)!;
        var fullUser = await LoadUserForSignInAsync(user.Id);
        if (fullUser == null)
            return ServiceResponse<SocialSignInResultDto>.Create("Failed to sign you in. Please try again.", 500);

        var signInBlockMessage = _authHelperService.GetSignInBlockMessage(fullUser);
        if (signInBlockMessage != null)
        {
            _logger.LogWarning("Social sign-in rejected for a disabled, deleted or tenant-invalid account. UserId={UserId}", fullUser.Id);
            return ServiceResponse<SocialSignInResultDto>.Create(signInBlockMessage, 401);
        }

        if (SsoConfigHelpers.IsSsoOfferedForTenant(
                fullUser.Tenant, _environmentConfig.IsSsoAllowedForDeployment, _environmentConfig.MicrosoftSsoEnabled))
            return BuildSsoRequiredResult(providerName, fullUser.Tenant!, email, authState);

        var isLinked = (await _userManager.GetLoginsAsync(fullUser))
            .Any(l => l.LoginProvider == providerName && l.ProviderKey == providerKey);

        if (!isLinked)
        {
            if (!isLinkVerified && !isProviderOwnedMailbox)
                return BuildLinkCodeRequiredResult(providerName, providerKey, email, authState);

            var linkResult = await LinkProviderAccountAsync(fullUser, providerName, providerKey);
            if (!linkResult)
                return ServiceResponse<SocialSignInResultDto>.Create("Failed to link your account. Please try again.", 500);

            await WriteSocialSignInConnectedAuditLogAsync(fullUser.Id, providerName, false);
            await SendSocialSignInConnectedEmailAsync(fullUser, providerName);
        }

        return BuildSignInResult(fullUser, providerName, authState);
    }

    private async Task<ServiceResponse<SocialSignInResultDto>> CreateSocialAccountAsync(
        ExternalAuthProviderEnum provider, SocialIdentity identity, SsoAuthStateDto authState)
    {
        var providerName = SocialAuthHelpers.GetProviderName(provider)!;
        var (firstName, lastName) = SocialAuthHelpers.SplitFullName(identity.FullName);
        var newUserId = Guid.NewGuid();
        var newUser = new AccountUser
        {
            Id = newUserId,
            UserName = identity.Email,
            Email = identity.Email,
            EmailConfirmed = true,
            FirstName = CapitalizeFirstLetterUtil.CapitalizeFirstLetter(firstName),
            LastName = CapitalizeFirstLetterUtil.CapitalizeFirstLetter(lastName),
            CreatedByUserId = newUserId,
            LastModifiedByUserId = newUserId,
            IsDefault = false, // DO NOT CHANGE THIS
            IsEditable = true  // DO NOT CHANGE THIS
        };

        var createUserResult = await _userManager.CreateAsync(newUser);
        if (!createUserResult.Succeeded)
        {
            // IMPORTANT NOTE: RequireUniqueEmail rejects a parallel sign-up for the same email, so the winning account is linked instead of creating a duplicate.
            if (createUserResult.Errors.Any(e =>
                    e.Code is nameof(IdentityErrorDescriber.DuplicateEmail) or nameof(IdentityErrorDescriber.DuplicateUserName)))
            {
                var racedUser = await _userManager.FindByEmailAsync(identity.Email);
                if (racedUser != null)
                    return await ContinueExistingUserAsync(racedUser, provider,
                        identity.ProviderKey, identity.Email, authState, false, identity.IsProviderOwnedMailbox);
            }

            foreach (var error in createUserResult.Errors)
            {
                _logger.LogError("Social sign-up user creation failed. Code={Code}, Description={Description}", error.Code, error.Description);
            }

            return ServiceResponse<SocialSignInResultDto>.Create("Failed to create your account. Please try again later", 500);
        }

        var linkResult = await LinkProviderAccountAsync(newUser, providerName, identity.ProviderKey);
        if (!linkResult)
            return ServiceResponse<SocialSignInResultDto>.Create("Failed to link your account. Please try again.", 500);

        var provisioned = await AccountProvisioningHelpers.ProvisionNewAccountAsync(
            _userManager, _unitOfWork, _environmentConfig, _accountsDbContext, _logger, newUser);

        if (!provisioned)
            return ServiceResponse<SocialSignInResultDto>.Create("Failed to create your account. Please try again later", 500);

        await AccountProvisioningHelpers.SendAccountCreatedEmailAsync(_emailService, _environmentConfig, _logger, newUser);
        await WriteSocialSignInConnectedAuditLogAsync(newUser.Id, providerName, true);

        var fullUser = await LoadUserForSignInAsync(newUser.Id);
        if (fullUser == null)
            return ServiceResponse<SocialSignInResultDto>.Create("Failed to create your account. Please try again later", 500);

        _logger.LogInformation("Account created through social sign-in. UserId={UserId}, Provider={Provider}", fullUser.Id, providerName);

        return BuildSignInResult(fullUser, providerName, authState);
    }

    private async Task<bool> LinkProviderAccountAsync(AccountUser user, string providerName, string providerKey)
    {
        var addLoginResult = await _userManager.AddLoginAsync(user, new UserLoginInfo(providerName, providerKey, providerName));
        if (addLoginResult.Succeeded) return true;

        // IMPORTANT NOTE: a parallel attempt may have linked the same provider account, which is the desired end state.
        var linkedUser = await _userManager.FindByLoginAsync(providerName, providerKey);
        if (linkedUser == null)
        {
            foreach (var error in addLoginResult.Errors)
            {
                _logger.LogError("Social sign-in link failed. Code={Code}, Description={Description}", error.Code, error.Description);
            }
        }

        return linkedUser != null;
    }

    private ServiceResponse<SocialSignInResultDto> BuildSignInResult(AccountUser user, string providerName, SsoAuthStateDto authState)
    {
        var outcome = user.Tenant?.IsTwoFAEnabled == true || user.TwoFactorEnabled
            ? SocialSignInOutcomeEnum.TwoFARequired
            : SocialSignInOutcomeEnum.SignedIn;

        return ServiceResponse<SocialSignInResultDto>.Create("Social sign-in resolved.", 200, new SocialSignInResultDto
        {
            Outcome = outcome,
            Provider = providerName,
            Email = user.Email ?? string.Empty,
            User = user,
            ReturnUrl = authState.ReturnUrl,
            HasPlanIntent = authState.HasPlanIntent
        });
    }

    private ServiceResponse<SocialSignInResultDto> BuildLinkCodeRequiredResult(
        string providerName, string providerKey, string email, SsoAuthStateDto authState)
    {
        return ServiceResponse<SocialSignInResultDto>.Create("Account link requires a confirmation code.", 200, new SocialSignInResultDto
        {
            Outcome = SocialSignInOutcomeEnum.LinkCodeRequired,
            Provider = providerName,
            Email = email,
            ProviderKey = providerKey,
            ReturnUrl = authState.ReturnUrl,
            HasPlanIntent = authState.HasPlanIntent
        });
    }

    private ServiceResponse<SocialSignInResultDto> BuildSsoRequiredResult(
        string providerName, Tenant ssoTenant, string email, SsoAuthStateDto authState)
    {
        if (!SsoConfigHelpers.IsSsoOfferedForTenant(
                ssoTenant, _environmentConfig.IsSsoAllowedForDeployment, _environmentConfig.MicrosoftSsoEnabled))
            return ServiceResponse<SocialSignInResultDto>.Create("This account must sign in with single sign-on.", 400);

        var loginUrlResult = GenerateLoginUrlAsync(ExternalAuthProviderEnum.Azure, email, ssoTenant.Id);
        if (string.IsNullOrWhiteSpace(loginUrlResult.Data))
            return ServiceResponse<SocialSignInResultDto>.Create(
                loginUrlResult.Message ?? "Single sign-on is not available.", 400);

        return ServiceResponse<SocialSignInResultDto>.Create("Single sign-on is required.", 200, new SocialSignInResultDto
        {
            Outcome = SocialSignInOutcomeEnum.SsoRequired,
            Provider = providerName,
            Email = email,
            SsoLoginUrl = loginUrlResult.Data,
            ReturnUrl = authState.ReturnUrl,
            HasPlanIntent = authState.HasPlanIntent
        });
    }

    private async Task<ServiceResponse<SocialIdentity>> ExchangeGoogleCodeAsync(string code, SsoAuthStateDto authState)
    {
        var clientId = _environmentConfig.GoogleOAuthClientId;
        var clientSecret = _environmentConfig.GoogleOAuthClientSecret;

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return ServiceResponse<SocialIdentity>.Create(SocialAuthHelpers.NotConfiguredMessage, 400);

        string? idToken;
        try
        {
            using var http = _httpClientFactory.CreateClient();
            using var response = await http.PostAsync(GoogleTokenEndpoint, new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["grant_type"] = "authorization_code",
                ["code"] = code,
                ["redirect_uri"] = BuildSocialRedirectUrl(),
                ["code_verifier"] = authState.CodeVerifier
            }));

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Google token endpoint failed. Status={Status}", response.StatusCode);
                return ServiceResponse<SocialIdentity>.Create("Google rejected the sign-in. Please try again.", 401);
            }

            using var jsonDoc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

            if (!jsonDoc.RootElement.TryGetProperty("id_token", out var idTokenElement) ||
                string.IsNullOrWhiteSpace(idToken = idTokenElement.GetString()))
                return ServiceResponse<SocialIdentity>.Create("Invalid token response from Google.", 401);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google token exchange failed.");
            return ServiceResponse<SocialIdentity>.Create("Failed to sign you in. Please try again.", 401);
        }

        OpenIdConnectConfiguration configuration;
        try
        {
            configuration = await GoogleConfigurationManager.GetConfigurationAsync(CancellationToken.None);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve the Google OpenID configuration.");
            return ServiceResponse<SocialIdentity>.Create("Unable to verify the identity token. Please try again later.", 401);
        }

        ClaimsPrincipal principal;
        try
        {
            var validationHandler = new JwtSecurityTokenHandler { MapInboundClaims = false };
            principal = validationHandler.ValidateToken(
                idToken, SsoConfigHelpers.BuildIdTokenValidationParameters(configuration, clientId), out _);
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning("Google identity token validation failed. Reason={Reason}", ex.GetType().Name);
            return ServiceResponse<SocialIdentity>.Create("The identity token is not valid.", 401);
        }

        var issuer = principal.FindFirst("iss")?.Value;
        if (issuer is not ("https://accounts.google.com" or "accounts.google.com"))
        {
            _logger.LogWarning("Google identity token issuer is not supported.");
            return ServiceResponse<SocialIdentity>.Create("The identity token is not valid.", 401);
        }

        if (!string.Equals(principal.FindFirst("nonce")?.Value, authState.Nonce, StringComparison.Ordinal))
            return ServiceResponse<SocialIdentity>.Create("Invalid or expired sign-in attempt.", 400);

        if (!bool.TryParse(principal.FindFirst("email_verified")?.Value, out var isEmailVerified) || !isEmailVerified)
            return ServiceResponse<SocialIdentity>.Create("Verify your email address with Google, or sign up with email.", 400);

        var email = principal.FindFirst("email")?.Value?.Trim().ToLowerInvariant();
        var providerKey = principal.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(providerKey))
            return ServiceResponse<SocialIdentity>.Create("Email not found in the identity token.", 401);

        var hasHostedDomain = !string.IsNullOrWhiteSpace(principal.FindFirst("hd")?.Value);

        return ServiceResponse<SocialIdentity>.Create("Google identity verified.", 200, new SocialIdentity(
            providerKey,
            email,
            principal.FindFirst("name")?.Value,
            SocialAuthHelpers.IsProviderOwnedMailbox(ExternalAuthProviderEnum.Google, email, hasHostedDomain)));
    }

    private async Task<ServiceResponse<SocialIdentity>> ExchangeGitHubCodeAsync(string code, SsoAuthStateDto authState)
    {
        var clientId = _environmentConfig.GitHubOAuthClientId;
        var clientSecret = _environmentConfig.GitHubOAuthClientSecret;

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return ServiceResponse<SocialIdentity>.Create(SocialAuthHelpers.NotConfiguredMessage, 400);

        try
        {
            using var http = _httpClientFactory.CreateClient();
            http.DefaultRequestHeaders.UserAgent.ParseAdd(GitHubUserAgent);
            http.DefaultRequestHeaders.Accept.ParseAdd("application/json");

            using var tokenResponse = await http.PostAsync(GitHubTokenEndpoint, new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["code"] = code,
                ["redirect_uri"] = BuildSocialRedirectUrl(),
                ["code_verifier"] = authState.CodeVerifier
            }));

            if (!tokenResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning("GitHub token endpoint failed. Status={Status}", tokenResponse.StatusCode);
                return ServiceResponse<SocialIdentity>.Create("GitHub rejected the sign-in. Please try again.", 401);
            }

            using var tokenDoc = JsonDocument.Parse(await tokenResponse.Content.ReadAsStringAsync());
            var accessToken = tokenDoc.RootElement.TryGetProperty("access_token", out var tokenElement)
                ? tokenElement.GetString()
                : null;

            if (string.IsNullOrWhiteSpace(accessToken))
                return ServiceResponse<SocialIdentity>.Create("GitHub rejected the sign-in. Please try again.", 401);

            var userResult = await SendGitHubGetAsync(accessToken, GitHubUserEndpoint);
            if (userResult == null)
                return ServiceResponse<SocialIdentity>.Create("Failed to read your GitHub account. Please try again.", 401);

            var providerKey = userResult.Value.TryGetProperty("id", out var idElement) ? idElement.GetRawText() : null;
            var displayName = userResult.Value.TryGetProperty("name", out var nameElement) ? nameElement.GetString() : null;

            var emailsResult = await SendGitHubGetAsync(accessToken, GitHubEmailsEndpoint);
            if (emailsResult == null || emailsResult.Value.ValueKind != JsonValueKind.Array)
                return ServiceResponse<SocialIdentity>.Create("Failed to read your GitHub email addresses. Please try again.", 401);

            string? email = null;
            foreach (var address in emailsResult.Value.EnumerateArray())
            {
                var isPrimary = address.TryGetProperty("primary", out var primaryElement) && primaryElement.ValueKind == JsonValueKind.True;
                var isVerified = address.TryGetProperty("verified", out var verifiedElement) && verifiedElement.ValueKind == JsonValueKind.True;

                if (!isPrimary || !isVerified) continue;

                email = address.TryGetProperty("email", out var emailElement) ? emailElement.GetString() : null;
                break;
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogInformation("GitHub sign-in rejected because no primary verified email address is available.");
                return ServiceResponse<SocialIdentity>.Create(SocialAuthHelpers.GitHubEmailNotVerifiedMessage, 400);
            }

            if (string.IsNullOrEmpty(providerKey))
                return ServiceResponse<SocialIdentity>.Create("Failed to read your GitHub account. Please try again.", 401);

            return ServiceResponse<SocialIdentity>.Create("GitHub identity verified.", 200, new SocialIdentity(
                providerKey, email.Trim().ToLowerInvariant(), displayName, false));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GitHub token exchange failed.");
            return ServiceResponse<SocialIdentity>.Create("Failed to sign you in. Please try again.", 401);
        }
    }

    private async Task<JsonElement?> SendGitHubGetAsync(string accessToken, string url)
    {
        using var http = _httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.UserAgent.ParseAdd(GitHubUserAgent);
        http.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await http.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("GitHub API request failed. Url={Url}, Status={Status}", url, response.StatusCode);
            return null;
        }

        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return document.RootElement.Clone();
    }

    private string BuildGoogleAuthorizeUrl(string clientId, string redirectUri, string state, string nonce, string codeChallenge)
    {
        var parameters = new List<string>
        {
            $"client_id={Uri.EscapeDataString(clientId)}",
            "response_type=code",
            $"redirect_uri={Uri.EscapeDataString(redirectUri)}",
            $"scope={Uri.EscapeDataString(GoogleLoginScope)}",
            $"state={state}",
            $"nonce={nonce}",
            $"code_challenge={codeChallenge}",
            "code_challenge_method=S256",
            "prompt=select_account"
        };

        return $"{GoogleAuthorizeEndpoint}?{string.Join("&", parameters)}";
    }

    private string BuildGitHubAuthorizeUrl(string clientId, string redirectUri, string state, string codeChallenge)
    {
        var parameters = new List<string>
        {
            $"client_id={Uri.EscapeDataString(clientId)}",
            $"redirect_uri={Uri.EscapeDataString(redirectUri)}",
            $"scope={Uri.EscapeDataString(GitHubLoginScope)}",
            $"state={state}",
            $"code_challenge={codeChallenge}",
            "code_challenge_method=S256"
        };

        return $"{GitHubAuthorizeEndpoint}?{string.Join("&", parameters)}";
    }

    private string BuildSocialRedirectUrl() => $"https://{_environmentConfig.AppBaseUrl}/accounts/sso-redirect";

    private bool IsBindingValid(SsoAuthStateDto authState, string state)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return false;

        var bindingValue = httpContext.Request.Cookies[SocialAuthHelpers.GetBindingCookieName(state)];
        if (string.IsNullOrWhiteSpace(bindingValue) || string.IsNullOrWhiteSpace(authState.BindingHash)) return false;

        var expectedHash = SocialAuthHelpers.GenerateBindingHash(
            bindingValue, httpContext.Request.Headers.UserAgent.ToString());

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expectedHash), Encoding.UTF8.GetBytes(authState.BindingHash));
    }

    private void ClearBindingCookie(string state)
    {
        _httpContextAccessor.HttpContext?.Response.Cookies.Delete(SocialAuthHelpers.GetBindingCookieName(state), new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        });
    }

    private async Task DeleteSocialLinkChallengeAsync(VerificationCode verificationCode)
    {
        await _authStateCache.RemoveAsync($"{SocialLinkCachePrefix}{verificationCode.Id}");

        _unitOfWork.VerificationCodeRepo.Delete(verificationCode);
        if (!await _unitOfWork.SaveAsync())
            _logger.LogWarning("Failed to burn the social link challenge. VerificationCodeId={VerificationCodeId}", verificationCode.Id);
    }

    private async Task<AccountUser?> LoadUserForSignInAsync(Guid userId)
    {
        return await _accountsDbContext.Users
            .Where(w => w.Id == userId)
            .AsSplitQuery()
            .Include(i => i.Tenant)
            .Include(i => i.UserRoles)
                .ThenInclude(i1 => i1.Role)
                    .ThenInclude(i2 => i2.RolePermissions)
                        .ThenInclude(i3 => i3.Permission)
            .SingleOrDefaultAsync();
    }

    private async Task<SocialLinkChallengeDto?> GetSocialLinkChallengeAsync(Guid verificationCodeId)
    {
        var stored = await _authStateCache.GetStringAsync($"{SocialLinkCachePrefix}{verificationCodeId}");
        if (stored == null) return null;

        try
        {
            return JsonSerializer.Deserialize<SocialLinkChallengeDto>(stored);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private async Task WriteSocialSignInConnectedAuditLogAsync(Guid userId, string providerName, bool isNewAccount)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EntityName = nameof(AccountUser),
            EntityId = userId,
            Action = "SOCIAL_SIGNIN_CONNECTED",
            Changes = JsonSerializer.Serialize(new
            {
                provider = providerName,
                isNewAccount,
                actorUserId = userId
            }),
            Timestamp = DateTime.UtcNow
        };

        await _unitOfWork.AuditLogRepo.InsertAsync(auditLog);

        if (!await _unitOfWork.SaveAsync())
            _logger.LogWarning("Failed to persist the social sign-in audit entry for UserId: {UserId}", userId);
    }

    private async Task SendSocialSignInConnectedEmailAsync(AccountUser user, string providerName)
    {
        var placeholderValues = new Dictionary<string, string>
        {
            { "{{userFirstName}}", GetGreetingNameUtil.GetGreetingName(user.FirstName, user.Email) },
            { "{{providerName}}", providerName }
        };

        if (!await _emailService.SendEmailUsingTemplate(
            emailType: EmailTypesEnum.SocialSignInConnected,
            toEmailAddress: user.Email!,
            placeholderValues: placeholderValues))
        {
            _logger.LogError("Failed to send the social sign-in connected email. UserId={UserId}", user.Id);
        }
    }

    private sealed record SocialIdentity(string ProviderKey, string Email, string? FullName, bool IsProviderOwnedMailbox);
}
