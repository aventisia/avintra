using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace AccountsAPIs.Services;

public class LoginWithExternalAuthService : ILoginWithExternalAuthService
{
    private const string EntraOrganizationsAuthority = "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize";
    private const string EntraAdminConsentAuthority = "https://login.microsoftonline.com/organizations/v2.0/adminconsent";
    private const string EntraOrganizationsDiscovery = "https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration";
    private const string EntraLoginScope = "openid profile email offline_access";
    private const string MicrosoftConsumerTenantId = "9188040d-6c67-4c5b-b112-36a304b66dad";
    private static readonly TimeSpan AuthStateTtl = TimeSpan.FromMinutes(10);
    private static readonly object AuthStateConsumeLock = new();

    private static readonly ConfigurationManager<OpenIdConnectConfiguration> EntraConfigurationManager =
        new(EntraOrganizationsDiscovery, new OpenIdConnectConfigurationRetriever(), new HttpDocumentRetriever());

    private readonly ILogger<LoginWithExternalAuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly IAuthHelperService _authHelperService;
    private readonly IDistributedCache _authStateCache;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AccountsDbContext _accountsDbContext;

    public LoginWithExternalAuthService(
        ILogger<LoginWithExternalAuthService> logger,
        IUnitOfWork unitOfWork,
        EnvironmentConfig environmentConfig,
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        IAuthHelperService authHelperService,
        IDistributedCache authStateCache,
        IHttpClientFactory httpClientFactory,
        AccountsDbContext accountsDbContext)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _environmentConfig = environmentConfig;
        _userManager = userManager;
        _emailService = emailService;
        _authHelperService = authHelperService;
        _authStateCache = authStateCache;
        _httpClientFactory = httpClientFactory;
        _accountsDbContext = accountsDbContext;
    }

    private string? GetSsoUnavailableMessage()
    {
        if (!_environmentConfig.IsSsoAllowedForDeployment)
        {
            return "Single sign-on is not available in the Community edition.";
        }

        if (!_environmentConfig.MicrosoftSsoEnabled)
        {
            return "Single sign-on is not enabled for this deployment.";
        }

        return null;
    }

    // Generates an authentication URL for a specific external provider (Azure, Google, Facebook, Twitter).
    public ServiceResponse<string> GenerateLoginUrlAsync(ExternalAuthProviderEnum type)
    {
        return GenerateLoginUrlAsync(type, null, Guid.Empty);
    }

    // Generates an authentication URL carrying the email hint and the OAuth state binding for a specific tenant.
    public ServiceResponse<string> GenerateLoginUrlAsync(ExternalAuthProviderEnum type, string? email, Guid tenantId)
    {
        // Initialize default service response with failure state
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Failed to generate login URL. Please try again"
        };

        try
        {
            switch (type)
            {
                case ExternalAuthProviderEnum.Azure:
                    var ssoUnavailableMessage = GetSsoUnavailableMessage();
                    if (ssoUnavailableMessage != null)
                    {
                        serviceResponse.Message = ssoUnavailableMessage;
                        _logger.LogWarning("Microsoft login URL generation blocked because single sign-on is unavailable.");
                        return serviceResponse;
                    }

                    var resolvedClientId = _environmentConfig.MicrosoftSsoClientId;
                    if (string.IsNullOrWhiteSpace(resolvedClientId))
                    {
                        serviceResponse.Message = "Microsoft SSO client id is not configured. Set the MICROSOFT_SSO_CLIENT_ID environment variable.";
                        _logger.LogWarning("Microsoft login URL generation blocked because no client id is configured.");
                        return serviceResponse;
                    }

                    serviceResponse.Data = BuildEntraAuthorizeUrl(resolvedClientId, email, tenantId, false);
                    break;

                case ExternalAuthProviderEnum.Google:
                    _logger.LogWarning("Google login URL generation not implemented.");
                    return serviceResponse;

                case ExternalAuthProviderEnum.Facebook:
                    _logger.LogWarning("Facebook login URL generation not implemented.");
                    return serviceResponse;

                case ExternalAuthProviderEnum.Twitter:
                    _logger.LogWarning("Twitter login URL generation not implemented.");
                    return serviceResponse;

                default:
                    serviceResponse.Message = "Unsupported authentication provider";
                    _logger.LogError("Unsupported authentication provider requested. Provider={Provider}", type);
                    return serviceResponse;
            }

            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Login URL generated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating login URL for provider {Provider}", type);
        }

        return serviceResponse;
    }

    // Generates an administrator consent URL that binds the granted tenant id to the supplied tenant.
    public ServiceResponse<string> GenerateAdminConsentUrlAsync(string? email, Guid tenantId)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Failed to generate administrator consent URL. Please try again"
        };

        try
        {
            var ssoUnavailableMessage = GetSsoUnavailableMessage();
            if (ssoUnavailableMessage != null)
            {
                serviceResponse.Message = ssoUnavailableMessage;
                _logger.LogWarning("Admin consent URL generation blocked because single sign-on is unavailable.");
                return serviceResponse;
            }

            var resolvedClientId = _environmentConfig.MicrosoftSsoClientId;
            if (string.IsNullOrWhiteSpace(resolvedClientId))
            {
                serviceResponse.Message = "Microsoft SSO client id is not configured. Set the MICROSOFT_SSO_CLIENT_ID environment variable.";
                _logger.LogWarning("Admin consent URL generation blocked because no client id is configured.");
                return serviceResponse;
            }

            serviceResponse.Data = BuildEntraAdminConsentUrl(resolvedClientId, email, tenantId);
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Administrator consent URL generated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating administrator consent URL.");
        }

        return serviceResponse;
    }

    // Consumes the single-use OAuth state created while generating an authorization URL.
    public SsoAuthStateDto? ConsumeAuthState(string? state)
    {
        if (string.IsNullOrWhiteSpace(state)) return null;

        var cacheKey = BuildAuthStateCacheKey(state);

        string? stored;
        // IMPORTANT NOTE: the cache is process memory, so read-and-delete is only single use on a single replica or with sticky sessions.
        lock (AuthStateConsumeLock)
        {
            stored = _authStateCache.GetString(cacheKey);
            if (stored == null) return null;

            _authStateCache.Remove(cacheKey);
        }

        try
        {
            return JsonSerializer.Deserialize<SsoAuthStateDto>(stored);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public async Task<ServiceResponse<AccountUser>> EntraTokenAsync(string code, string? state)
    {
        // Initialize default failure response object
        var serviceResponse = new ServiceResponse<AccountUser>
        {
            Data = null,
            Message = "Failed to validate token. Please try again"
        };

        // Precondition check: Authorization code must be present
        if (string.IsNullOrWhiteSpace(code))
        {
            _logger.LogWarning("EntraTokenAsync called with empty or null authorization code.");

            serviceResponse.Message = "Authorization code is missing.";
            serviceResponse.StatusCode = 400;
            return serviceResponse;
        }

        // CSRF precondition: the single-use state must be present and unexpired
        var authState = ConsumeAuthState(state);
        if (authState == null)
        {
            _logger.LogWarning("Entra callback rejected because the OAuth state is missing, unknown or already used.");
            serviceResponse.Message = "Invalid or expired SSO state.";
            serviceResponse.StatusCode = 400;
            return serviceResponse;
        }

        return await ExchangeAndValidateEntraCodeAsync(code, authState);
    }

    private async Task<ServiceResponse<AccountUser>> ExchangeAndValidateEntraCodeAsync(string code, SsoAuthStateDto authState)
    {
        var serviceResponse = new ServiceResponse<AccountUser>
        {
            Data = null,
            Message = "Failed to validate token. Please try again"
        };

        if (authState.AdminConsent)
        {
            _logger.LogWarning("Entra login callback rejected because the state belongs to an administrator consent request.");
            serviceResponse.Message = "Invalid or expired SSO state.";
            serviceResponse.StatusCode = 400;
            return serviceResponse;
        }

        var ssoUnavailableMessage = GetSsoUnavailableMessage();
        if (ssoUnavailableMessage != null)
        {
            serviceResponse.StatusCode = 400;
            serviceResponse.Message = ssoUnavailableMessage;
            return serviceResponse;
        }

        var ssoTenant = await ResolveSsoTenantAsync(authState);
        var ssoConfig = SsoConfigHelpers.Parse(ssoTenant?.SSOConfigJson);
        var clientId = _environmentConfig.MicrosoftSsoClientId;
        var clientSecret = _environmentConfig.MicrosoftSsoClientSecret;

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            serviceResponse.Message = "Microsoft SSO credentials are not configured. Set the MICROSOFT_SSO_CLIENT_ID and MICROSOFT_SSO_CLIENT_SECRET environment variables.";
            serviceResponse.StatusCode = 400;
            return serviceResponse;
        }

        // Build redirect URI used in both authorize and token calls (must match exactly)
        string redirectUrl = $"https://{_environmentConfig.AppBaseUrl}/accounts/sso-redirect";

        if (string.IsNullOrWhiteSpace(ssoConfig?.ExternalTenantId))
        {
            serviceResponse.Message = "Single sign-on is not configured for this tenant.";
            serviceResponse.StatusCode = 400;
            return serviceResponse;
        }

        var tokenAuthority = ssoConfig.ExternalTenantId;
        string tokenEndpoint = $"https://login.microsoftonline.com/{tokenAuthority}/oauth2/v2.0/token";

        _logger.LogInformation("Prepared Azure token request. TenantId={TenantId}", authState.TenantId);

        try
        {
            var form = new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["grant_type"] = "authorization_code",
                ["code"] = code,
                ["redirect_uri"] = redirectUrl,
                ["scope"] = EntraLoginScope
            };

            using var http = _httpClientFactory.CreateClient();
            using var response = await http.PostAsync(tokenEndpoint, new FormUrlEncodedContent(form));

            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Azure token endpoint failed. Status={Status}", response.StatusCode);
                serviceResponse.Message = "Azure token endpoint returned an error.";
                serviceResponse.StatusCode = 401;
                return serviceResponse;
            }

            using var jsonDoc = JsonDocument.Parse(json);

            if (!jsonDoc.RootElement.TryGetProperty("id_token", out var idTokenElement))
            {
                _logger.LogError("Azure token response missing id_token.");
                serviceResponse.Message = "Invalid token response from Azure.";
                serviceResponse.StatusCode = 401;
                return serviceResponse;
            }

            var idToken = idTokenElement.GetString();

            if (string.IsNullOrWhiteSpace(idToken))
            {
                _logger.LogError("Azure token response returned an empty id_token.");
                serviceResponse.Message = "Received empty token from Azure.";
                serviceResponse.StatusCode = 401;
                return serviceResponse;
            }

            var validateRequest = new ValidateTokenRequestDto
            {
                Type = ExternalAuthProviderEnum.Azure,
                Token = idToken,
                ClientId = clientId,
                AuthState = authState,
                SsoTenantId = ssoTenant?.Id
            };

            return await ValidateTokenAndCreateUserAsync(validateRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during Entra token exchange.");
            serviceResponse.Message = "Failed to validate token. Please try again";
            return serviceResponse;
        }
    }

    private async Task<Tenant?> ResolveSsoTenantAsync(SsoAuthStateDto authState)
    {
        if (authState.TenantId != Guid.Empty)
        {
            return await _unitOfWork.TenantRepo
                .GetByConditionAsync(t =>
                    t.Id == authState.TenantId &&
                    t.IsSSOEnabled &&
                    t.Type == TenantTypesEnum.Organization)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        return await ResolveSsoTenantByDomainAsync(authState.Email);
    }

    private async Task<Tenant?> ResolveSsoTenantByDomainAsync(string? email)
    {
        var emailDomain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(email);
        if (string.IsNullOrWhiteSpace(emailDomain)) return null;

        return await _unitOfWork.TenantRepo
            .GetByConditionAsync(t =>
                t.Domain != string.Empty &&
                t.IsSSOEnabled &&
                t.Type == TenantTypesEnum.Organization &&
                t.Domain.ToLower() == emailDomain)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }

    private string BuildEntraAuthorizeUrl(string clientId, string? email, Guid tenantId, bool adminConsent)
    {
        var state = GenerateOpaqueValue();
        var nonce = GenerateOpaqueValue();

        _authStateCache.SetString(
            BuildAuthStateCacheKey(state),
            JsonSerializer.Serialize(new SsoAuthStateDto
            {
                Nonce = nonce,
                TenantId = tenantId,
                Email = email,
                AdminConsent = adminConsent
            }),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = AuthStateTtl });

        string redirectUrl = $"https://{_environmentConfig.AppBaseUrl}/accounts/sso-redirect";

        var parameters = new List<string>
        {
            $"client_id={Uri.EscapeDataString(clientId)}",
            "response_type=code",
            $"redirect_uri={Uri.EscapeDataString(redirectUrl)}",
            "response_mode=query",
            $"scope={Uri.EscapeDataString(EntraLoginScope)}",
            $"state={state}",
            $"nonce={nonce}"
        };

        if (!string.IsNullOrWhiteSpace(email))
        {
            parameters.Add($"login_hint={Uri.EscapeDataString(email)}");
        }

        return $"{EntraOrganizationsAuthority}?{string.Join("&", parameters)}";
    }

    private string BuildEntraAdminConsentUrl(string clientId, string? email, Guid tenantId)
    {
        var state = GenerateOpaqueValue();

        _authStateCache.SetString(
            BuildAuthStateCacheKey(state),
            JsonSerializer.Serialize(new SsoAuthStateDto
            {
                Nonce = string.Empty,
                TenantId = tenantId,
                Email = email,
                AdminConsent = true
            }),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = AuthStateTtl });

        string redirectUrl = $"https://{_environmentConfig.AppBaseUrl}/accounts/sso-redirect";

        var parameters = new List<string>
        {
            $"client_id={Uri.EscapeDataString(clientId)}",
            $"redirect_uri={Uri.EscapeDataString(redirectUrl)}",
            $"state={state}",
            $"scope={Uri.EscapeDataString(EntraLoginScope)}"
        };

        return $"{EntraAdminConsentAuthority}?{string.Join("&", parameters)}";
    }

    private static string BuildAuthStateCacheKey(string state) => $"sso-state:{state}";

    private static string GenerateOpaqueValue() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    private static string GetClaimValue(JwtSecurityToken token, params string[] claimTypes)
    {
        foreach (var claimType in claimTypes)
        {
            var value = token.Claims.FirstOrDefault(c => c.Type == claimType)?.Value;
            if (!string.IsNullOrWhiteSpace(value)) return value;
        }

        return string.Empty;
    }

    // Verifies the Entra id_token signature, audience and lifetime, then binds tid, issuer, nonce and domain to the registered tenant.
    private async Task<(bool IsValid, int StatusCode, string Message, JwtSecurityToken? Token)> ValidateEntraIdTokenAsync(ValidateTokenRequestDto request)
    {
        var authState = request.AuthState;
        if (authState == null)
        {
            return (false, 400, "Invalid or expired SSO state.", null);
        }

        if (string.IsNullOrWhiteSpace(request.ClientId))
        {
            return (false, 401, "SSO client id is not configured.", null);
        }

        // Resolve the tenant that was registered for this authorization attempt before trusting any token claim
        var registeredTenant = await ResolveSsoTenantAsync(authState);
        var registeredConfig = SsoConfigHelpers.Parse(registeredTenant?.SSOConfigJson);

        if (registeredTenant == null || registeredConfig == null || string.IsNullOrWhiteSpace(registeredConfig.ExternalTenantId))
        {
            _logger.LogWarning("Entra callback rejected because no active single sign-on tenant matched the authorization attempt.");
            return (false, 400, "No single sign-on tenant is registered for this email domain.", null);
        }

        OpenIdConnectConfiguration configuration;
        try
        {
            configuration = await EntraConfigurationManager.GetConfigurationAsync(CancellationToken.None);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve the Entra OpenID configuration.");
            return (false, 401, "Unable to verify the identity token. Please try again later.", null);
        }

        var validationParameters = SsoConfigHelpers.BuildEntraIdTokenValidationParameters(configuration, request.ClientId);

        ClaimsPrincipal principal;
        SecurityToken validatedToken;
        try
        {
            var validationHandler = new JwtSecurityTokenHandler { MapInboundClaims = false };
            principal = validationHandler.ValidateToken(request.Token, validationParameters, out validatedToken);
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning("Entra identity token signature, audience or lifetime validation failed. Reason={Reason}", ex.GetType().Name);
            return (false, 401, "The identity token is not valid.", null);
        }

        var tokenTenantId = principal.FindFirst("tid")?.Value;
        var issuer = principal.FindFirst("iss")?.Value;
        var nonce = principal.FindFirst("nonce")?.Value;
        var email = principal.FindFirst("preferred_username")?.Value
            ?? principal.FindFirst("upn")?.Value
            ?? principal.FindFirst("unique_name")?.Value
            ?? principal.FindFirst("email")?.Value;

        if (string.IsNullOrWhiteSpace(tokenTenantId))
        {
            return (false, 401, "The identity token is missing the tenant claim.", null);
        }

        // Reject the Microsoft consumer tenant outright
        if (string.Equals(tokenTenantId, MicrosoftConsumerTenantId, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Entra callback rejected a personal Microsoft account.");
            return (false, 400, "Personal Microsoft accounts are not allowed.", null);
        }

        // The issuer must be the verified tenant claim, which must equal the registered external tenant id
        var expectedIssuer = $"https://login.microsoftonline.com/{tokenTenantId}/v2.0";
        if (!string.Equals(issuer, expectedIssuer, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Entra identity token issuer did not match its tenant claim.");
            return (false, 401, "The identity token is not valid.", null);
        }

        if (!string.Equals(registeredConfig.ExternalTenantId, tokenTenantId, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Cross-tenant identity token rejected. TenantId={TenantId}", registeredTenant.Id);
            return (false, 401, "The identity token does not match the registered tenant.", null);
        }

        if (string.IsNullOrWhiteSpace(nonce) || !string.Equals(nonce, authState.Nonce, StringComparison.Ordinal))
        {
            _logger.LogWarning("Entra identity token nonce did not match the issued nonce. TenantId={TenantId}", registeredTenant.Id);
            return (false, 400, "Invalid or expired SSO state.", null);
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return (false, 401, "Email not found in token.", null);
        }

        var emailDomain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(email);
        if (SsoConfigHelpers.IsConsumerEmailDomain(emailDomain))
        {
            _logger.LogWarning("Entra callback rejected a consumer email domain. EmailDomain={EmailDomain}", emailDomain);
            return (false, 400, "Personal email domains are not allowed.", null);
        }

        if (!string.Equals(registeredConfig.EmailDomain, emailDomain, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Entra identity token email domain did not match the registered domain. TenantId={TenantId}", registeredTenant.Id);
            return (false, 400, "Email domain does not match the registered single sign-on domain.", null);
        }

        return (true, 200, "Identity token verified.", (JwtSecurityToken)validatedToken);
    }

    private Guid? ResolveJitTargetTenantId(ValidateTokenRequestDto validateTokenRequestDto)
    {
        if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString())
        {
            return Guid.Parse(_environmentConfig.OnPremTenantId);
        }

        return validateTokenRequestDto.SsoTenantId;
    }

    // Validates the external authentication token and creates or retrieves the user
    public async Task<ServiceResponse<AccountUser>> ValidateTokenAndCreateUserAsync(ValidateTokenRequestDto validateTokenRequestDto)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<AccountUser>()
        {
            Data = null,
            Message = "Failed to validate token. Please try again",
        };

        try
        {
            // JWT handler for the issued identity token
            var handler = new JwtSecurityTokenHandler();

            // Validation: ensure the token format is readable
            if (!handler.CanReadToken(validateTokenRequestDto.Token))
            {
                _logger.LogWarning("Invalid or unreadable JWT token received.");
                serviceResponse.Message = "Invalid token format.";
                serviceResponse.StatusCode = 401;
                return serviceResponse;
            }

            // Initialize user identity variables extracted from token
            string firstName = string.Empty;
            string lastName = string.Empty;
            string email = string.Empty;

            // Extract identity claims based on external provider
            switch (validateTokenRequestDto.Type)
            {
                case ExternalAuthProviderEnum.Azure:
                    var entraValidation = await ValidateEntraIdTokenAsync(validateTokenRequestDto);
                    if (!entraValidation.IsValid || entraValidation.Token == null)
                    {
                        _logger.LogWarning(
                            "Entra identity token rejected. StatusCode={StatusCode}, Reason={Reason}",
                            entraValidation.StatusCode, entraValidation.Message);

                        serviceResponse.Message = entraValidation.Message;
                        serviceResponse.StatusCode = entraValidation.StatusCode;
                        return serviceResponse;
                    }

                    // Extract email-related claims
                    email = GetClaimValue(entraValidation.Token, "preferred_username", "upn", "unique_name", "email");

                    // Extract name-related claims
                    firstName = GetClaimValue(entraValidation.Token, "given_name");
                    lastName = GetClaimValue(entraValidation.Token, "family_name");

                    _logger.LogInformation("User claims extracted from a verified Entra identity token. Email={Email}", email);
                    break;

                case ExternalAuthProviderEnum.Google:
                    // Validation: Google token parsing is not implemented yet
                    _logger.LogWarning(
                        "Google token validation requested but not implemented. Provider={Provider}",
                        validateTokenRequestDto.Type);
                    return serviceResponse;

                case ExternalAuthProviderEnum.Facebook:
                    // Validation: Facebook token parsing is not implemented yet
                    _logger.LogWarning(
                        "Facebook token validation requested but not implemented. Provider={Provider}",
                        validateTokenRequestDto.Type);
                    return serviceResponse;

                case ExternalAuthProviderEnum.Twitter:
                    // Validation: Twitter token parsing is not implemented yet
                    _logger.LogWarning(
                        "Twitter token validation requested but not implemented. Provider={Provider}",
                        validateTokenRequestDto.Type);
                    return serviceResponse;

                default:
                    // Validation: unsupported provider for token validation
                    _logger.LogWarning(
                        "Unsupported external auth provider during token validation. Provider={Provider}",
                        validateTokenRequestDto.Type);

                    serviceResponse.Message = "Unsupported authentication provider.";
                    return serviceResponse;
            }

            // Validation: email is mandatory for user identification
            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("Token validation failed: email claim missing.");
                serviceResponse.Message = "Email not found in token.";
                serviceResponse.StatusCode = 401;
                return serviceResponse;
            }

            // Validation: enterprise tenants require email domain match
            if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString())
            {
                var appDomain = ExtractDomainFromEmailUtil.ExtractDomainFromUrl(_environmentConfig.AppBaseUrl);
                var emailDomain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(email);

                if (!appDomain.Equals(emailDomain, StringComparison.InvariantCultureIgnoreCase))
                {
                    _logger.LogWarning(
                        "Enterprise domain validation failed. EmailDomain={EmailDomain}, AppDomain={AppDomain}",
                        emailDomain, appDomain);

                    serviceResponse.StatusCode = 400;
                    serviceResponse.Message = "Email domain does not match the platform's domain.";
                    return serviceResponse;
                }
            }

            // Check database for an existing user with the same email
            var existingUser = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => w.Email.ToLower() == email.ToLower())
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                var existingUserBlockMessage = _authHelperService.GetSignInBlockMessage(existingUser);
                if (existingUserBlockMessage != null)
                {
                    _logger.LogWarning(
                        "Single sign-on sign-in rejected for a disabled, deleted or tenant-invalid account. UserId={UserId}",
                        existingUser.Id);

                    serviceResponse.Message = existingUserBlockMessage;
                    serviceResponse.StatusCode = 401;
                    return serviceResponse;
                }
            }

            // Condition: create user only if not already present
            if (existingUser == null)
            {
                var jitTargetTenantId = ResolveJitTargetTenantId(validateTokenRequestDto);
                if (jitTargetTenantId.HasValue)
                {
                    var jitTargetTenant = await _unitOfWork.TenantRepo
                        .GetByConditionAsync(t => t.Id == jitTargetTenantId.Value)
                        .AsNoTracking()
                        .FirstOrDefaultAsync();

                    if (jitTargetTenant == null || !_authHelperService.IsUserTenantValid(jitTargetTenant, email))
                    {
                        _logger.LogWarning(
                            "Single sign-on sign-up rejected because the target tenant is missing, disabled or expired. TenantId={TenantId}",
                            jitTargetTenantId.Value);

                        serviceResponse.Message = "Unable to retrieve your tenant's details. Please contact your support administrator.";
                        serviceResponse.StatusCode = 401;
                        return serviceResponse;
                    }
                }

                _logger.LogInformation(
                    "User does not exist. Proceeding with new user creation. Email={Email}",
                    email);

                // Generate a new unique user identifier
                Guid newUserId = Guid.NewGuid();

                // Initialize AccountUser entity
                var newUser = new AccountUser
                {
                    Id = newUserId,
                    UserName = email.ToLower(),
                    Email = email.ToLower(),
                    EmailConfirmed = true,
                    FirstName = CapitalizeFirstLetterUtil.CapitalizeFirstLetter(firstName),
                    LastName = CapitalizeFirstLetterUtil.CapitalizeFirstLetter(lastName),
                    CreatedByUserId = newUserId,
                    LastModifiedByUserId = newUserId,
                    IsDefault = false, // Business rule: must remain false
                    IsEditable = true  // Business rule: must remain true
                };

                // Persist user in identity store
                var createUserResult = await _userManager.CreateAsync(newUser);

                // Validation: ensure user creation succeeded
                if (!createUserResult.Succeeded)
                {
                    foreach (var error in createUserResult.Errors)
                    {
                        _logger.LogError(
                            "User creation failed. Code={Code}, Description={Description}",
                            error.Code, error.Description);
                    }

                    serviceResponse.Message = "Failed to create your account. Please try again later";
                    return serviceResponse;
                }

                _logger.LogInformation(
                    "User created successfully. UserId={UserId}, Email={Email}",
                    newUserId, email);

                // Variables to hold tenant assignment and role mapping
                Guid tenantId;
                List<string> userRoles;

                // Condition: enterprise tenant vs non-enterprise tenant
                if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString())
                {
                    // Assign enterprise tenant and default role
                    userRoles = new List<string> { CustomRolesEnum.TD.ToString(), CustomRolesEnum.TU.ToString() };
                    tenantId = Guid.Parse(_environmentConfig.OnPremTenantId);
                    _logger.LogInformation("Enterprise tenant assigned. TenantId={TenantId}, UserId={UserId}", tenantId, newUser.Id);
                }
                else if (validateTokenRequestDto.SsoTenantId.HasValue)
                {
                    // Join the domain-matched single sign-on tenant with the default member roles only
                    tenantId = validateTokenRequestDto.SsoTenantId.Value;
                    userRoles = new List<string> { CustomRolesEnum.TD.ToString(), CustomRolesEnum.TU.ToString() };
                    _logger.LogInformation("Single sign-on tenant assigned. TenantId={TenantId}, UserId={UserId}", tenantId, newUser.Id);
                }
                else
                {
                    // Create a new tenant for non-enterprise users
                    var userTenant = new Tenant
                    {
                        Id = Guid.NewGuid(),
                        Name = newUser.Email,
                        ContainerName = TenantContainerUtil.GenerateName(newUser.Email),
                        Domain = string.Empty,
                        Type = TenantTypesEnum.Unspecified,
                        ResourceType = TenantResourceTypesEnum.Shared,
                        Currency = CurrencyTypesEnum.USD,
                        ExpiresOn = DateTimeOffset.MaxValue, // TODO: We need to remove or update it
                        Role = string.Empty,
                        CreatedByUserId = newUser.Id,
                        LastModifiedByUserId = newUser.Id
                    };

                    await _unitOfWork.TenantRepo.InsertAsync(userTenant);

                    // Validation: ensure tenant creation succeeded
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError(
                            "Tenant creation failed for user. UserId={UserId}",
                            newUser.Id);
                        return serviceResponse;
                    }

                    tenantId = userTenant.Id;

                    await DefaultSpaceHelpers.EnsureDefaultSpaceAsync(
                        _accountsDbContext, userTenant.Id, userTenant.CreatedByUserId, userTenant.LastModifiedByUserId, _logger);

                    // Assign all roles except Super Admin
                    userRoles = Enum.GetValues(typeof(CustomRolesEnum))
                        .Cast<CustomRolesEnum>()
                        .Where(w => w != CustomRolesEnum.SA)
                        .Select(r => r.ToString())
                        .ToList();

                    _logger.LogInformation(
                        "Tenant created successfully. TenantId={TenantId}, UserId={UserId}",
                        tenantId, newUser.Id);
                }

                // Link tenant to user
                newUser.TenantId = tenantId;
                _unitOfWork.AccountUserRepo.Update(newUser);

                // Validation: ensure tenant-user link is persisted
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError(
                        "Failed to link tenant to user. TenantId={TenantId}, UserId={UserId}",
                        tenantId, newUser.Id);
                    return serviceResponse;
                }

                _logger.LogInformation(
                    "Tenant linked to user successfully. TenantId={TenantId}, UserId={UserId}",
                    tenantId, newUser.Id);

                // Assign roles to user
                var addToRolesResult = await _userManager.AddToRolesAsync(newUser, userRoles);

                // Validation: ensure role assignment succeeded
                if (!addToRolesResult.Succeeded)
                {
                    foreach (var error in addToRolesResult.Errors)
                    {
                        _logger.LogError(
                            "Role assignment failed. UserId={UserId}, Code={Code}, Description={Description}",
                            newUser.Id, error.Code, error.Description);
                    }

                    serviceResponse.Message = "Failed to assign roles to user. Please try again later.";
                    return serviceResponse;
                }

                // Prepare placeholder values for account creation email
                var placeholderValues = new Dictionary<string, string>
                {
                    { "{{userFirstName}}", newUser.FirstName }
                };

                // Attempt to send account creation email (non-blocking)
                if (!await _emailService.SendEmailUsingTemplate(
                    emailType: EmailTypesEnum.AccountCreated,
                    toEmailAddress: newUser.Email,
                    placeholderValues: placeholderValues,
                    bccEmailAddresses: _environmentConfig.SalesEmails))
                {
                    _logger.LogError(
                        "Failed to send account creation email. Email={Email}",
                        newUser.Email);
                }

                // Reload user with tenant and role details
                existingUser = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => EF.Functions.ILike(newUser.Email, w.UserName))
                    .AsSplitQuery()
                    .Include(i => i.Tenant)
                    .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                    .AsNoTracking()
                    .SingleOrDefaultAsync();
            }

            // Successful validation response
            serviceResponse.Data = existingUser;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User validated successfully.";
            return serviceResponse;
        }
        catch (Exception ex)
        {
            // Catch-all error handling for token validation flow
            _logger.LogError(
                ex,
                "Token validation failed for provider {Provider}",
                validateTokenRequestDto.Type);

            serviceResponse.Message = "Token validation failed.";
            return serviceResponse;
        }
    }
}
