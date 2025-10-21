namespace AccountsAPIs.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly HttpContext _httpContext;
    private readonly VerificationCodeConfig _verificationCodeConfig;
    private readonly IdentityConfig _identityConfig;
    private readonly JwtConfig _jwtConfig;
    private readonly ILogger<AuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;
    private readonly DefaultTenantConfig _defaultTenantConfig;

    public AuthService(
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuthService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        IdentityConfig identityConfig,
        JwtConfig jwtConfig,
        VerificationCodeConfig verificationCodeConfig,
        DefaultTenantConfig defaultTenantConfig)
    {
        _userManager = userManager;
        _emailService = emailService;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authHelperService = authHelperService;
        _identityConfig = identityConfig;
        _jwtConfig = jwtConfig;
        _verificationCodeConfig = verificationCodeConfig;
        _defaultTenantConfig = defaultTenantConfig;
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
            _logger.LogError(ex.ToString());
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
            // Try to get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => EF.Functions.ILike(emailDto.Email, w.UserName))
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation($"Account not found, while trying to fetch " +
                    $"tenant info for email {emailDto.Email}");
                serviceResponse.Message = "User account does not exist";
                return serviceResponse;
            }

            TenantInfoDto? tenantInfoDto = null;
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
                    SSOConfigJson = user.Tenant.IsSSOEnabled ? user.Tenant.SSOConfigJson : null
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
            _logger.LogError(ex.ToString());
            return serviceResponse;
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
                _logger.LogInformation($"User-Agent not found in request header " +
                            $"for user {user.UserName}");
                serviceResponse.Message = "Something went wrong. Please try again later";
                return serviceResponse;
            }

            // Get current active sessions count
            var activeSessionCount = await _unitOfWork.ActiveSessionRepo
                                        .GetByConditionAsync(w => w.UserId == user.Id)
                                        .AsNoTracking()
                                        .CountAsync();

            // Allowed active session limit exhausted
            if (activeSessionCount >= _identityConfig.MaxActiveSessionAllowed)
            {
                _logger.LogInformation($"Maximum allowed active session limit " +
                    $"exhausted for {user.UserName}");
                serviceResponse.Message = "Maximum allowed active session limit exhausted. " +
                                          "Please logoff from other devices or browsers first";
                return serviceResponse;
            }

            // Get Jwt and RefreshToken validity config
            var jwtExpiresOn = DateTimeOffset.UtcNow.AddMinutes(
                _jwtConfig.AuthJwtValidityInMinutes);
            var refreshTokenExpiresOn = DateTimeOffset.UtcNow.AddDays(
                _jwtConfig.RefreshTokenValidityInDays);

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

            // User is not created in other databases yet.
            if (user.IsCreatedInOtherDbs == false && user.Tenant != null)
            {
                try
                {
                    // Get user roles
                    var userRoles = await _userManager.GetRolesAsync(user);

                    // Try to add user in other databases
                    var createUserInOtherDbsResult = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Create, jwt, userRoles.Contains("AE"));

                    // // Failed to add user in other databases
                    if (!createUserInOtherDbsResult) return serviceResponse;

                    // Update user's IsCreatedInOtherDbs status
                    user.IsCreatedInOtherDbs = true;
                    _unitOfWork.AccountUserRepo.Update(user);
                }
                catch
                {
                    // Try catch important because on create-account request AccountUserRepo.Update will throw unnecessary exception
                }
            }

            // ActiveSession Insert job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Context SaveChanges failed while creating session for {user.UserName}");
                return serviceResponse;
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
                UserInitials = GetUserInitialsUtil.GetUserInitials(user.FirstName, user.LastName),
                AccessToken = jwt,
                RefreshToken = refreshToken,
                RTExpiresOn = refreshTokenExpiresOn
            };

            // Check if the user is associated with an organization (tenant)
            if (user.Tenant == null || user.Tenant.Type == TenantTypesEnum.Unspecified)
            {
                serviceResponse.Message = "Complete organization setup to continue.";
            }
            else
            {
                // Query the current tenant's subscription, including related plan and creator details
                var subscription = await _unitOfWork.TenantSubscriptionRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == user.TenantId
                    )
                    .FirstOrDefaultAsync();

                // Check if a valid subscription was found
                if (subscription == null || subscription.Status == SubscriptionStatusTypesEnum.Initiated)
                {
                    _logger.LogWarning("No active subscription found for user {UserId} in tenant {TenantId}.", user.Id, user.TenantId);
                    serviceResponse.Message = "Tenant has no active subscription.";
                }
                else
                {
                    serviceResponse.Message = "New session has been created successfully.";
                }
            }

            // UserSessionDto is ready
            _logger.LogInformation($"New session has been created successfully for {user.UserName}");
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
                _logger.LogInformation($"Context SaveChanges failed while creating " +
                    $"session logs for user {userName} and reason - {howSessionEnded}");
                serviceResponse.Message = "Something went wrong while creating session " +
                    "log. Please try again later";
                return serviceResponse;
            }

            // Delete expiredSessions
            _unitOfWork.ActiveSessionRepo.Delete(sessionList);

            // Delete-expiredSessions job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Context SaveChanges failed while deleting " +
                    $"sessions for user {userName} and reason - {howSessionEnded}");
                serviceResponse.Message = "Something went wrong while deleting sessions. " +
                                          "Please try again later";
                return serviceResponse;
            }

            // Task successful
            foreach (var sessionId in sessionIds)
            {
                _logger.LogInformation($"Session of session Id {sessionId} for " +
                    $"Username {userName} has been terminated with reason - {howSessionEnded}");
            }
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Session has been terminated";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
                VerificationCodeId = Guid.Empty,
                Email = createVerificationCodeDto.Email,
                RequestType = createVerificationCodeDto.RequestType
            },
            StatusCode = 200,
            Message = "Verification code has been sent to your email",
        };

        try
        {
            // Gather required data to create verification code
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.UserName.ToString(), out var signedInEmail);
            var requestType = createVerificationCodeDto.RequestType;

            var userName = requestType switch
            {
                VerificationCodeRequestTypesEnum.VerifyEmailAddress or
                VerificationCodeRequestTypesEnum.ResetPwd or
                VerificationCodeRequestTypesEnum.UnlockAccount => createVerificationCodeDto.Email,
                _ => signedInEmail
            };

            // Get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => EF.Functions.ILike(userName, w.UserName))
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

            switch (requestType)
            {
                //create account verify email
                case VerificationCodeRequestTypesEnum.VerifyEmailAddress:
                    {
                        // Request type is "VerifyEmailAddress" while creating the account
                        if (user != null)
                        {
                            _logger.LogInformation("Cannot fullfill VerifyEmailAddress request type because User account already exits. While creating verification code for  requestType - {RequestType}, username - {UserName} and device Id - {UserAgent}",
                        requestType, userName, userAgent);
                            return serviceResponse;
                        }
                        var id = await SendEmail(createVerificationCodeDto, user?.FirstName, userAgent);
                        serviceResponse.Data.VerificationCodeId = id;
                        return serviceResponse;
                    }
                // user must have account
                case VerificationCodeRequestTypesEnum.ResetPwd:
                case VerificationCodeRequestTypesEnum.UnlockAccount:
                case VerificationCodeRequestTypesEnum.AccountDeactivation:
                case VerificationCodeRequestTypesEnum.UpdateEmail:
                    {
                        if (user == null)
                        {
                            _logger.LogInformation(user.IsDisabled ?
                            "User account is disabled. While creating verification code for requestType - {RequestType}, username - {UserName} and device Id - {UserAgent}" :
                            "User account not found. requestType - {RequestType}, username - {UserName} and device Id - {UserAgent}",
                            requestType, userName, userAgent);
                            return serviceResponse;
                        }
                        var id = await SendEmail(createVerificationCodeDto, user?.FirstName, userAgent);
                        serviceResponse.Data.VerificationCodeId = id;
                        return serviceResponse;
                    }
                //not implemented
                case VerificationCodeRequestTypesEnum.TwoFA:
                case VerificationCodeRequestTypesEnum.UpdatePwd:
                default:
                    {
                        serviceResponse.StatusCode = 403;
                        serviceResponse.Message = "Request type is not allowed";
                        return serviceResponse;
                    }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);
            return serviceResponse;
        }
    }

    async Task<Guid> SendEmail(CreateVerificationCodeDto createdVerificationCodeDto, string userFirstName, string userAgent)
    {
        // Create 6 secret code
        string secretCode = new Random().Next(100000, 999999).ToString();

        // Delete VerificationCodes (all expired + active for current userName and userAgent)
        await _authHelperService.DeleteVerificationCodes(createdVerificationCodeDto.Email, userAgent);

        // Create code's ExpiresOn
        var codeExpiresOn = DateTimeOffset.UtcNow.AddMinutes(_verificationCodeConfig.ValidityInMinutes);

        // Create VerificationCode instance
        var verificationCode = new VerificationCode()
        {
            SecretCode = secretCode,
            RequestType = createdVerificationCodeDto.RequestType,
            DeviceId = userAgent,
            ExpiresOn = codeExpiresOn,
            Email = createdVerificationCodeDto.Email,
        };

        // Insert VerificationCode
        await _unitOfWork.VerificationCodeRepo.InsertAsync(verificationCode);

        // Insert-VerificationCode job failed
        if (!await _unitOfWork.SaveAsync())
        {
            _logger.LogInformation("Context SaveChanges failed while creating verification code for requestType - {RequestType}, username - {UserName} and device Id - {UserAgent}",
            createdVerificationCodeDto.RequestType, createdVerificationCodeDto.Email, userAgent);
            return Guid.Empty;
        }

        // Convert requestType to EmailTypesEnum
        var emailType = Enum.Parse<EmailTypesEnum>(createdVerificationCodeDto.RequestType.ToString());

        // Failed to send VerificationCode email
        if (!await _emailService.SendEmailUsingTemplate(
            emailType,
            createdVerificationCodeDto.Email,
            new Dictionary<string, string>()
            {
                    {"{{userFirstName}}", userFirstName },
                    {"{{VerificationCode}}", verificationCode.SecretCode},
                    {"{{VerificationCodeValidityInMinutes}}", _verificationCodeConfig.ValidityInMinutes.ToString() }
            }))
        {
            _logger.LogError("Error occurred while sending verification code email to {Email} and request type {RequestType}", createdVerificationCodeDto.Email, createdVerificationCodeDto.RequestType);
            /*Still moving forward because we are not going to inform user*/
        }
        return verificationCode.Id;
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