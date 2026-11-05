namespace AccountsAPIs.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly HttpContext _httpContext;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly ILogger<AuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;
    private readonly ILoginWithExternalAuthService _loginWithExternalAuthService;

    public AuthService(
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuthService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        EnvironmentConfig environmentConfig,
        AppDefaultConfig appDefaultConfig,
        ILoginWithExternalAuthService loginWithExternalAuthService)
    {
        _userManager = userManager;
        _emailService = emailService;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authHelperService = authHelperService;
        _environmentConfig = environmentConfig;
        _appDefaultConfig = appDefaultConfig;
        _loginWithExternalAuthService = loginWithExternalAuthService;
    }

    // Checks the availability of a email.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsEmailAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check email availability. Please try again"
        };

        try
        {
            //Valid  email format
            string regex = @"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$";

            //Check if user input matches with valid email format
            if (!Regex.IsMatch(checkAvailabilityDto.UserInput, regex, RegexOptions.IgnoreCase))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "An email entered  is invalid. Please try different email address";
                return serviceResponse;
            }

            // Get user by email (Note: email and username are same)
            var user = await _userManager.FindByNameAsync(checkAvailabilityDto.UserInput.Trim().ToLower());

            // Email already exists
            if (user != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "An account with same email already exists. Please try different email address";
                return serviceResponse;
            }


            // Extract the domain from the user's email input and check if a tenant with this domain exists,
            // excluding default tenants like Aventisia and IndividualUsers
            // TODO: Uncomment the following code block when email domain validation against existing tenants (excluding default tenants) is needed
            // var domain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(checkAvailabilityDto.UserInput);
            // var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w =>
            //     w.Domain.ToLower() == domain &&
            //     (
            //         w.Name.ToLower() != GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.Aventisia) &&
            //         w.Name.ToLower() != GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers)
            //     )
            // )
            // .FirstOrDefaultAsync();

            // if (tenant != null)
            // {
            //     serviceResponse.Data = new TrueFalseResultDto { Result = false };
            //     serviceResponse.StatusCode = 200;
            //     serviceResponse.Message = "An organization with this email domain already exists. Please contact support team.";
            //     return serviceResponse;
            // }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{checkAvailabilityDto.UserInput.Trim().ToLower()} is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check email availability.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Validates the username and gets the tenant and its SSO config (if SSO is enabled).
    public async Task<ServiceResponse<TenantInfoDto>> GetTenantInfoAsync(EmailDto emailDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TenantInfoDto>
        {
            Data = null,
            Message = "Failed to get tenant info. Please try again later"
        };

        try
        {
            // Check if authentication-related operations are globally disabled.
            // This can be due to maintenance, security incidents, or temporary administrative restrictions.
            if (_environmentConfig.OnPremLoginDisabled)
            {
                serviceResponse.StatusCode = 403;
                serviceResponse.Message = "Authentication is currently disabled. Please contact Aventisia Support for assistance.";
                return serviceResponse;
            }
            // Try to get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => EF.Functions.ILike(emailDto.Email, w.UserName))
                    .Include(i => i.Tenant)
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                serviceResponse.Message = "User account does not exist";
                return serviceResponse;
            }

            // Variable to hold tenant information for the response
            TenantInfoDto? tenantInfoDto = null;

            // Offer the Azure login URL only when the deployment allows single sign-on, the tenant
            // switch is on and the connection is bound
            var isSsoLoginOffered = SsoConfigHelpers.IsSsoOfferedForTenant(
                    user.Tenant,
                    _environmentConfig.IsSsoAllowedForDeployment,
                    _environmentConfig.MicrosoftSsoEnabled);

            var azureLoginUrl = isSsoLoginOffered
                    ? _loginWithExternalAuthService.GenerateLoginUrlAsync(
                        ExternalAuthProviderEnum.Azure, user.UserName, user.Tenant.Id).Data
                    : null;

            // Check if the user is associated with an organization (tenant)
            if (user.TenantId != null)
            {
                // Tenant is null/disabled/expired
                if (!_authHelperService.IsUserTenantValid(user.Tenant, user.UserName))
                {
                    serviceResponse.Message = "Not able to retrieve your tenant's details. Please contact support adminstrator";
                    return serviceResponse;
                }

                // Create TenantInfoDto instance
                tenantInfoDto = new TenantInfoDto()
                {
                    UserName = user.UserName,
                    Name = user.Tenant.IsDefault ? "default" : user.Tenant.Name,
                    TenantId = user.Tenant.Id,
                    SSOConfigJson = azureLoginUrl
                };
            }
            else
            {
                tenantInfoDto = new TenantInfoDto()
                {
                    UserName = user.UserName,
                    Name = "NA",
                    TenantId = Guid.Empty,
                    SSOConfigJson = null
                };
            }

            // Task successful
            serviceResponse.Data = tenantInfoDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Success";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve tenant info.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Resolves the single sign-on tenant for an email address for home realm discovery.
    public async Task<ServiceResponse<SsoDiscoverDto>> DiscoverTenantAsync(EmailDto emailDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SsoDiscoverDto>
        {
            Data = null,
            Message = "Failed to discover single sign-on configuration. Please try again later"
        };

        try
        {
            // Check if authentication-related operations are globally disabled.
            if (_environmentConfig.OnPremLoginDisabled)
            {
                serviceResponse.StatusCode = 403;
                serviceResponse.Message = "Authentication is currently disabled. Please contact Aventisia Support for assistance.";
                return serviceResponse;
            }

            var emailDomain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(emailDto.Email);
            var noMatch = new SsoDiscoverDto { SsoLoginUrl = null, Provider = null, TenantId = null };

            // Consumer/public mail domains can never map to an organization single sign-on tenant
            if (string.IsNullOrWhiteSpace(emailDomain) || SsoConfigHelpers.IsConsumerEmailDomain(emailDomain))
            {
                serviceResponse.Data = noMatch;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Success";
                return serviceResponse;
            }

            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t =>
                    t.Domain != string.Empty &&
                    t.IsSSOEnabled &&
                    t.Type == TenantTypesEnum.Organization &&
                    t.Domain.ToLower() == emailDomain)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (tenant == null || !SsoConfigHelpers.IsSsoOfferedForTenant(
                    tenant,
                    _environmentConfig.IsSsoAllowedForDeployment,
                    _environmentConfig.MicrosoftSsoEnabled))
            {
                serviceResponse.Data = noMatch;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Success";
                _logger.LogInformation("SSO discovery completed without a matching tenant. EmailDomain={EmailDomain}", emailDomain);
                return serviceResponse;
            }

            var loginUrlResult = _loginWithExternalAuthService.GenerateLoginUrlAsync(
                ExternalAuthProviderEnum.Azure, emailDto.Email, tenant.Id);

            if (string.IsNullOrWhiteSpace(loginUrlResult.Data))
            {
                serviceResponse.Data = noMatch;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Success";
                return serviceResponse;
            }

            serviceResponse.Data = new SsoDiscoverDto
            {
                SsoLoginUrl = loginUrlResult.Data,
                Provider = SsoConfigHelpers.MicrosoftEntraProvider,
                TenantId = tenant.Id
            };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Success";
            _logger.LogInformation("SSO discovery matched a tenant. TenantId={TenantId}, EmailDomain={EmailDomain}", tenant.Id, emailDomain);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover single sign-on configuration.");
        }

        return serviceResponse;
    }

    // Creates an active user session.
    public async Task<ServiceResponse<UserSessionDto>> CreateUserSessionAsync(AccountUser user)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<UserSessionDto>
        {
            Data = null,
            Message = "Failed to create session. Please try again later"
        };

        try
        {
            // Get User-Agent
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();

            // UserAgent not found
            if (userAgent == null)
            {
                serviceResponse.Message = "Something went wrong. Please try again later";
                return serviceResponse;
            }

            // Get current active sessions count
            var activeSessionCount = await _unitOfWork.ActiveSessionRepo
                                        .GetByConditionAsync(w => w.UserId == user.Id)
                                        .AsNoTracking()
                                        .CountAsync();

            // Allowed active session limit exhausted
            if (activeSessionCount >= _environmentConfig.MaxActiveSessionAllowed)
            {
                serviceResponse.Message = "Maximum allowed active session limit exhausted. " +
                                          "Please logoff from other devices or browsers first";
                return serviceResponse;
            }

            // Get Jwt and RefreshToken validity config
            var jwtExpiresOn = DateTimeOffset.UtcNow.AddMinutes(
                _environmentConfig.JwtValidityInMinutes);
            var refreshTokenExpiresOn = DateTimeOffset.UtcNow.AddDays(
                _environmentConfig.JwtRefreshTokenValidityInDays);

            // Retrieve the tenant's subscription along with the associated plan details.
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.TenantId == user.TenantId && w.IsActive)
                .Include(i => i.Plan)
                .FirstOrDefaultAsync();

            // Extract the current plan type from the subscription, if available.
            string? currentPlan = tenantSubscription?.Plan?.Type.ToString();

            // Create Jwt string
            var sessionId = Guid.NewGuid();
            var jwt = _authHelperService.CreateJwt(user, jwtExpiresOn, false, sessionId, currentPlan);

            // Create RefreshToken
            var refreshToken = _authHelperService.CreateRefreshToken();

            var data = GetClientBrowserAndOs(_httpContext);
            // Create new ActiveSession instance
            var activeSession = new ActiveSession()
            {
                Id = sessionId,
                DeviceId = userAgent,
                IPAddress = data.ipAddress,
                BrowserType = data.Browser,
                OperatingSystem = data.OS,
                Location = "TODO", // TODO: Get location required subscription
                RefreshToken = refreshToken,
                SessionExpiresOn = refreshTokenExpiresOn,
                LoggedInOn = DateTimeOffset.UtcNow,
                LastRefreshOn = DateTimeOffset.UtcNow,
                UserId = user.Id
            };

            // Insert ActiveSession
            await _unitOfWork.ActiveSessionRepo.InsertAsync(activeSession);

            // ActiveSession Insert job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // User is not created in other databases yet.
            if (user.IsCreatedInOtherDbs == false && user.Tenant != null)
            {
                try
                {
                    // Get user roles
                    var userRoles = await _userManager.GetRolesAsync(user);

                    // Try to add user in other databases
                    var createUserInOtherDbsResult = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Create, jwt);

                    // Failed to add user in other databases: no session is issued so the sync is retried on the next login
                    if (!createUserInOtherDbsResult)
                    {
                        _logger.LogError("Failed to synchronize the user across services. UserId={UserId}", user.Id);
                        serviceResponse.Message = "Failed to provision your account across services. Please try again later.";
                        serviceResponse.StatusCode = 502;
                        return serviceResponse;
                    }

                    // Update user's IsCreatedInOtherDbs status using direct database update to avoid tracking conflicts
                    var updateResult = await _unitOfWork.AccountUserRepo
                        .GetByConditionAsync(w => w.Id == user.Id)
                        .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.IsCreatedInOtherDbs, true));

                    // Update AccountUser job failed
                    if (updateResult == 0)
                    {
                        serviceResponse.Message = "Failed to provision your account across services. Please try again later.";
                        serviceResponse.StatusCode = 502;
                        return serviceResponse;
                    }

                    // Update the in-memory user object to reflect the change
                    user.IsCreatedInOtherDbs = true;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to create user session.");
                    serviceResponse.Message = "Failed to provision your account across services. Please try again later.";
                    serviceResponse.StatusCode = 502;
                    return serviceResponse;
                }
            }

            // Append SessionId, Jwt/AccessToken, RefreshToken and Username to cookies
            _authHelperService.SetCookie(CookieNamesEnum.SessionId.ToString(), activeSession.Id.ToString(), refreshTokenExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.AccessToken.ToString(), jwt, jwtExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.RefreshToken.ToString(), refreshToken, refreshTokenExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.UserName.ToString(), user.UserName, refreshTokenExpiresOn);

            // Create UserSessionDto
            var userSessionDto = new UserSessionDto()
            {
                TenantName = user.Tenant != null ? user.Tenant.Name : "NA",
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserInitials = GetUserInitialsUtil.GetUserInitials(user.FirstName, user.LastName, user.Email),
                AccessToken = jwt,
                RefreshToken = refreshToken,
                RTExpiresOn = refreshTokenExpiresOn,
                Country = user.Tenant != null ? user.Tenant.Country.ToString() : "NA",
                PlatformVersion = _appDefaultConfig.PlatformVersion,
                HasPaidPlan = tenantSubscription?.Plan is { IsDefault: false }
            };

            // IMPORTANT NOTE: A verified free account keeps its tenant Unspecified and relies on the Active
            // Default subscription created at signup, so the organization-setup gate must not fire while that
            // subscription is usable. Genuinely incomplete tenants (no usable subscription) still require setup.
            var hasUsableActiveSubscription = tenantSubscription != null && tenantSubscription.Status != SubscriptionStatusTypesEnum.Initiated;

            // Check if the user is associated with an organization (tenant)
            if ((user.Tenant?.Type == TenantTypesEnum.Unspecified || user.Tenant == null) && !hasUsableActiveSubscription)
            {
                serviceResponse.Message = "Complete organization setup to continue.";
            }
            else if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Commercial.ToString())
            {
                // IMPORTANT NOTE: Once user has completed onboarding, then there will always be an 1 active subscription at 
                // any point of time even that subscription's status is expired. Users will be able to login even if subscription 
                // is expired they won't be able to access any paid features. In future, we may downgrade user's subscription to 
                // free Starter plan automatically once subscription is expired. In that case also there will be always one active subscription.

                // Subscription validation logic
                if (!hasUsableActiveSubscription)
                {
                    _logger.LogWarning("No active subscription found for user {UserId} in tenant {TenantId}.", user.Id, user.TenantId);
                    serviceResponse.Message = "Tenant has no active subscription.";
                }
                else
                {
                    serviceResponse.Message = "New session has been created successfully.";
                }
            }
            else
            {
                serviceResponse.Message = "New session has been created successfully.";
            }

            // UserSessionDto is ready
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user session.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Terminates user's sessions based on the provided sessionIds.
    public async Task<ServiceResponse<bool>> TerminateUserSessionsAsync(Guid userId, string userName, TerminateSessionReasonsEnum howSessionEnded, List<Guid>? sessionIdsParam = null)
    {
        /*Parameter - sessionIdsParam will be null if requesting to delete expired sessions only*/

        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Failed to terminate session. Please try again later"
        };

        try
        {
            // Initialize sessionIds
            List<Guid> sessionIds = new List<Guid>();

            // Requesting - Terminate expired sessions only
            if (sessionIdsParam == null)
            {
                // Get expired sessions where refresh token has expired
                sessionIds = await _unitOfWork.ActiveSessionRepo
                                        .GetByConditionAsync(w =>
                                            w.UserId == userId &&
                                            w.SessionExpiresOn <= DateTimeOffset.UtcNow)
                                        .Select(s => s.Id)
                                        .ToListAsync();
            }
            else
            {
                sessionIds = sessionIdsParam;
            }

            // Get session list
            var sessionList = await _unitOfWork.ActiveSessionRepo
                                        .GetByConditionAsync(w =>
                                            sessionIds.Contains(w.Id) &&
                                            w.UserId == userId)
                                        .ToListAsync();

            // If no session found
            if (sessionList.Count() == 0)
            {
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "There are no session to terminate";
                return serviceResponse;
            }

            // Create List<SessionLog> instance
            var sessionLogList = new List<SessionLog>();
            foreach (var session in sessionList)
            {
                // Create SessionLog instance
                var sessionLog = session.Adapt<SessionLog>();
                sessionLog.SessionTerminatedOn = DateTimeOffset.UtcNow;
                sessionLog.HowSessionEnded = howSessionEnded;

                // Add SessionLog instance to List
                sessionLogList.Add(sessionLog);
            }

            // Insert List<SessionLog>
            await _unitOfWork.SessionLogRepo.InsertAsync(sessionLogList);

            // Insert-SessionLog job failed
            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Message = "Something went wrong while creating session " +
                    "log. Please try again later";
                return serviceResponse;
            }

            // Delete expiredSessions
            _unitOfWork.ActiveSessionRepo.Delete(sessionList);

            // Delete-expiredSessions job failed
            if (!await _unitOfWork.SaveAsync())
            {
                serviceResponse.Message = "Something went wrong while deleting sessions. " +
                                          "Please try again later";
                return serviceResponse;
            }

            // Task successful
            foreach (var sessionId in sessionIds)
            {
            }
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Session has been terminated";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to terminate user sessions for {UserName}.", userName);
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Creates a verification code for the provided username and request type.
    public async Task<ServiceResponse<CreatedVerificationCodeDto>> CreateVerificationCodeAsync(CreateVerificationCodeDto createVerificationCodeDto)
    {

        /*Initialize ServiceResponse with Success response bcz whichever the outcome
        we are not going to inform the client about it due to security concerns*/
        var serviceResponse = new ServiceResponse<CreatedVerificationCodeDto>
        {
            Data = new CreatedVerificationCodeDto()
            {
                VerificationCodeId = Guid.NewGuid(),
                Email = createVerificationCodeDto.Email,
                RequestType = createVerificationCodeDto.RequestType
            },
            StatusCode = 200,
            Message = "Verification code has been sent to your email",
        };

        try
        {
            // Check if the tenant is of type Enterprise
            if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Enterprise.ToString())
            {
                var appDomain = ExtractDomainFromEmailUtil.ExtractDomainFromUrl(_environmentConfig.AppBaseUrl);
                var emailDomain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(createVerificationCodeDto.Email);
                if (!appDomain.Equals(emailDomain, StringComparison.InvariantCultureIgnoreCase))
                {
                    serviceResponse.StatusCode = 400;
                    serviceResponse.Message = "Email domain does not match the platform's domain.";
                    return serviceResponse;
                }
            }

            // Implemented RequestTypes: VerifyEmailAddress, TwoFA, ResetPwd, UpdateEmail
            // Not yet implemented RequestTypes: UnlockAccount, AccountDeactivation

            // Gather required data to create verification code
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();
            var userName = createVerificationCodeDto.Email;
            var requestType = createVerificationCodeDto.RequestType;

            // Get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => w.UserName == userName)
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

            // User account exists
            if (user != null)
            {
                // Request type is "VerifyEmailAddress"
                if (requestType == VerificationCodeRequestTypesEnum.VerifyEmailAddress)
                {
                    _logger.LogInformation(
                        "Cannot fullfill VerifyEmailAddress request type because User account already exits. While creating verification code for requestType - {RequestType}, username - {UserName} and device Id - {UserAgent}",
                        requestType, userName, userAgent);
                    return serviceResponse;
                }

                /*Locked account is allowed as user should be able to unlock account 
                 via creating code and verifing it*/

                // Account is disabled
                if (user.IsDisabled)
                {
                    _logger.LogInformation(
                        "User account is disabled. While creating verification code for requestType - {RequestType}, username - {UserName} and device Id - {UserAgent}",
                        requestType, userName, userAgent);
                    return serviceResponse;
                }
            }

            // User not found
            if (user == null &&
                requestType != VerificationCodeRequestTypesEnum.VerifyEmailAddress &&
                requestType != VerificationCodeRequestTypesEnum.UpdateEmail)
            {
                _logger.LogInformation(
                    "User account not found. While creating verification code for requestType - {RequestType}, username - {UserName} and device Id - {UserAgent}",
                    requestType, userName, userAgent);
                return serviceResponse;
            }

            /*NOTE: We are not validating tenantId here since it is not required */

            // Create 6 secret code
            string secretCode = new Random().Next(100000, 999999).ToString();

            // Delete VerificationCodes (all expired + active for current userName and userAgent)
            await _authHelperService.DeleteVerificationCodes(userName, userAgent);

            // Create code's ExpiresOn
            var codeExpiresOn = DateTimeOffset.UtcNow.AddMinutes(
                _environmentConfig.OtpValidityInMinutes);

            // Create VerificationCode instance
            var verificationCode = new VerificationCode()
            {
                SecretCode = secretCode,
                RequestType = requestType,
                DeviceId = userAgent,
                ExpiresOn = codeExpiresOn,
                Email = userName,
            };

            // Insert VerificationCode
            await _unitOfWork.VerificationCodeRepo.InsertAsync(verificationCode);

            // Insert-VerificationCode job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation(
                    "Context SaveChanges failed while creating verification code for requestType - {RequestType}, username - {UserName} and device Id - {UserAgent}",
                    requestType, userName, userAgent);
                return serviceResponse;
            }

            // Convert requestType to EmailTypesEnum
            var emailType = Enum.Parse<EmailTypesEnum>(requestType.ToString());

            // Failed to send VerificationCode email
            if (!await _emailService.SendEmailUsingTemplate(
                emailType,
                createVerificationCodeDto.Email,
                new Dictionary<string, string>()
                {
                    {"{{userFirstName}}", GetGreetingNameUtil.GetGreetingName(user?.FirstName, createVerificationCodeDto.Email) },
                    {"{{VerificationCode}}", verificationCode.SecretCode},
                    {"{{VerificationCodeValidityInMinutes}}", _environmentConfig.OtpValidityInMinutes.ToString() }
                }))
            {
                _logger.LogError(
                    "Error occurred while sending verification code email to {Email} and request type {RequestType}",
                    createVerificationCodeDto.Email, requestType);
                /*Still moving forward because we are not going to inform user*/
            }

            // Task successful
            serviceResponse.Data.VerificationCodeId = verificationCode.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create verification code.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    static (string? ipAddress, string Browser, string OS) GetClientBrowserAndOs(HttpContext context)
    {
        var ipAddress = context.Connection.RemoteIpAddress;

        // Handle forwarded headers (e.g., when behind a proxy or load balancer)
        if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            ipAddress = System.Net.IPAddress.Parse(context.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0]);
        }

        //TODO - required the UAParser package to be installed
        // var userAgent = context.Request.Headers["User-Agent"].ToString();
        // var uaParser = Parser.GetDefault();
        // var clientInfo = uaParser.Parse(userAgent);

        // string browser = clientInfo.UA.ToString();
        // string os = clientInfo.OS.ToString();

        return (ipAddress?.ToString(), "Chrome", "Windows 10");
    }
}
