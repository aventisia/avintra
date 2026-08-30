namespace AccountsAPIs.Services;

public class LoginWithExternalAuthService : ILoginWithExternalAuthService
{
    private readonly ILogger<LoginWithExternalAuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;

    public LoginWithExternalAuthService(
        ILogger<LoginWithExternalAuthService> logger,
        IUnitOfWork unitOfWork,
        EnvironmentConfig environmentConfig,
        UserManager<AccountUser> userManager,
        IEmailService emailService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _environmentConfig = environmentConfig;
        _userManager = userManager;
        _emailService = emailService;
    }

    // Generates an authentication URL for a specific external provider (Azure, Google, Facebook, Twitter).
    public ServiceResponse<string> GenerateLoginUrlAsync(ExternalAuthProviderEnum type)
    {
        // Initialize default service response with failure state
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Failed to generate login URL. Please try again"
        };

        // Variable to hold the generated authentication URL
        string loginUrl = string.Empty;

        // Redirect URI used by Azure Entra after successful login
        string redirectUrl = $"https://{_environmentConfig.AppBaseUrl}/accounts/sso-redirect";
        try
        {
            // Determine which external provider to use
            switch (type)
            {
                case ExternalAuthProviderEnum.Azure:
                    // Build Azure OAuth 2.0 authorization URL
                    loginUrl =
                        $"https://login.microsoftonline.com/{_environmentConfig.AzureTenantId}/oauth2/v2.0/authorize" +
                        $"?client_id={_environmentConfig.AzureEntraIdClientId}" +
                        $"&response_type=code" +
                        $"&redirect_uri={Uri.EscapeDataString(redirectUrl)}" +
                        $"&response_mode=query" +
                        $"&scope=openid profile email";

                    break;

                case ExternalAuthProviderEnum.Google:
                    // Provider validation: Google not implemented
                    _logger.LogWarning("Google login URL generation not implemented.");
                    return serviceResponse;

                case ExternalAuthProviderEnum.Facebook:
                    // Provider validation: Facebook not implemented
                    _logger.LogWarning("Facebook login URL generation not implemented.");
                    return serviceResponse;

                case ExternalAuthProviderEnum.Twitter:
                    // Provider validation: Twitter not implemented
                    _logger.LogWarning("Twitter login URL generation not implemented.");
                    return serviceResponse;

                default:
                    // Validation: unsupported authentication provider
                    serviceResponse.Message = "Unsupported authentication provider";
                    _logger.LogError("Unsupported authentication provider requested. Provider={Provider}", type);
                    return serviceResponse;
            }

            // Populate successful response
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = loginUrl;
            serviceResponse.Message = "Login URL generated successfully";
        }
        catch (Exception ex)
        {
            // Catch unexpected exceptions during URL generation
            _logger.LogError(ex, "Error generating login URL for provider {Provider}", type);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<AccountUser>> EntraTokenAsync(string code)
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
            return serviceResponse;
        }

        // Build redirect URI used in both authorize and token calls (must match exactly)
        string redirectUrl = $"https://{_environmentConfig.AppBaseUrl}/accounts/sso-redirect";

        // Azure Entra token endpoint for this tenant
        string tokenEndpoint = $"https://login.microsoftonline.com/{_environmentConfig.AzureTenantId}/oauth2/v2.0/token";

        _logger.LogInformation("Prepared Azure token request. TenantId={TenantId}, RedirectUrl={RedirectUrl}", _environmentConfig.AzureTenantId, redirectUrl);

        try
        {
            // Build form-urlencoded payload for token exchange
            var form = new Dictionary<string, string>
            {
                ["client_id"] = _environmentConfig.AzureEntraIdClientId,
                ["client_secret"] = _environmentConfig.AzureEntraIdClientSecret,
                ["grant_type"] = "authorization_code",
                ["code"] = code,
                ["redirect_uri"] = redirectUrl,
                ["scope"] = "openid profile email"
            };

            _logger.LogInformation("Sending token request to Azure Entra endpoint.");

            // Create HTTP client and send POST request to token endpoint
            using var http = new HttpClient();
            using var response = await http.PostAsync(tokenEndpoint, new FormUrlEncodedContent(form));

            // Read raw response body as string
            var json = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("Received response from Azure token endpoint. Status={StatusCode}", response.StatusCode);

            // Condition: Azure returned a non-success HTTP status code
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Azure token endpoint failed. Status={Status}, Body={Body}", response.StatusCode, json);
                serviceResponse.Message = "Azure token endpoint returned an error.";
                return serviceResponse;
            }

            // Parse JSON response body
            using var jsonDoc = JsonDocument.Parse(json);

            _logger.LogInformation("Parsed JSON response from Azure token endpoint.");

            // Condition: access_token field must be present
            if (!jsonDoc.RootElement.TryGetProperty("access_token", out var accessTokenElement))
            {
                _logger.LogError("Azure token response missing access_token. Body={Body}", json);
                serviceResponse.Message = "Invalid token response from Azure.";
                return serviceResponse;
            }

            // Extract access_token value
            var accessToken = accessTokenElement.GetString();

            _logger.LogInformation("Extracted access_token from Azure response.");

            // Condition: access_token must not be null or empty
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogError("Azure token response returned empty access_token. Body={Body}", json);
                serviceResponse.Message = "Received empty token from Azure.";
                return serviceResponse;
            }


            // Validate token and create or load local user
            var validateRequest = new ValidateTokenRequestDto
            {
                Type = ExternalAuthProviderEnum.Azure,
                Token = accessToken
            };

            _logger.LogInformation("Calling ValidateTokenAndCreateUserAsync.");

            return await ValidateTokenAndCreateUserAsync(validateRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during EntraTokenAsync.");
            return serviceResponse;
        }
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
            // JWT handler for reading token payload
            var handler = new JwtSecurityTokenHandler();

            // Validation: ensure the token format is readable
            if (!handler.CanReadToken(validateTokenRequestDto.Token))
            {
                _logger.LogWarning("Invalid or unreadable JWT token received.");
                serviceResponse.Message = "Invalid token format.";
                return serviceResponse;
            }

            // Parse JWT token
            var jwtToken = handler.ReadJwtToken(validateTokenRequestDto.Token);

            // Initialize user identity variables extracted from token
            string firstName = string.Empty;
            string lastName = string.Empty;
            string email = string.Empty;

            // Extract identity claims based on external provider
            switch (validateTokenRequestDto.Type)
            {
                case ExternalAuthProviderEnum.Azure:
                    // Extract email-related claims
                    email = jwtToken.Claims
                        .FirstOrDefault(c => c.Type == "unique_name" || c.Type == "upn")?.Value ?? string.Empty;

                    // Extract name-related claims
                    firstName = jwtToken.Claims.FirstOrDefault(c => c.Type == "given_name")?.Value ?? string.Empty;
                    lastName = jwtToken.Claims.FirstOrDefault(c => c.Type == "family_name")?.Value ?? string.Empty;

                    _logger.LogInformation("User claims extracted from token. Email={Email}, FirstName={FirstName}, LastName={LastName}", email, firstName, lastName);
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

            // Condition: create user only if not already present
            if (existingUser == null)
            {
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
                    userRoles = new List<string> { CustomRolesEnum.TD.ToString(), CustomRolesEnum.TD.ToString() };
                    tenantId = Guid.Parse(_environmentConfig.OnPremTenantId);
                    _logger.LogInformation("Enterprise tenant assigned. TenantId={TenantId}, UserId={UserId}", tenantId, newUser.Id);
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

            serviceResponse.Message = $"Token validation failed: {ex.Message}";
            return serviceResponse;
        }
    }
}