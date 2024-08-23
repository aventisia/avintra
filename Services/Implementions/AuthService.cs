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

    public AuthService(
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuthService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        IdentityConfig identityConfig,
        JwtConfig jwtConfig,
        VerificationCodeConfig verificationCodeConfig)
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

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email is available";
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
                    .GetByConditionAsync(w => w.UserName == emailDto.Email)
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

            // Tenant is null/disabled/expired
            if (!_authHelperService.IsUserTenantValid(user.Tenant, user.UserName))
            {
                serviceResponse.Message = "Not able to retrieve your tenant's details. Please contact support adminstrator";
                return serviceResponse;
            }

            // Create TenantInfoDto instance
            var tenantInfoDto = new TenantInfoDto()
            {
                UserName = user.UserName,
                Name = user.Tenant.IsDefault ? "default" : user.Tenant.Name,
                TenantId = user.Tenant.Id,
                SSOConfigJson = user.Tenant.IsSSOEnabled ? user.Tenant.SSOConfigJson : null
            };

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

            // Create Jwt string
            var sessionId = Guid.NewGuid();
            var jwt = _authHelperService.CreateJwt(user, jwtExpiresOn, false, sessionId);

            // Create RefreshToken
            var refreshToken = _authHelperService.CreateRefreshToken();

            // Create new ActiveSession instance
            var activeSession = new ActiveSession()
            {
                Id = sessionId,
                DeviceId = userAgent,
                IPAddress = "TODO", // TODO: Get IP address
                BrowserType = "TODO", // TODO: Get browser type
                OperatingSystem = "TODO", // TODO: Get OS
                Location = "TODO", // TODO: Get location
                RefreshToken = refreshToken,
                SessionExpiresOn = refreshTokenExpiresOn,
                LoggedInOn = DateTimeOffset.UtcNow,
                LastRefreshOn = DateTimeOffset.UtcNow,
                UserId = user.Id
            };

            // Insert ActiveSession
            await _unitOfWork.ActiveSessionRepo.InsertAsync(activeSession);

            // User is not created in other databases yet.
            if (user.IsCreatedInOtherDbs == false)
            {
                try
                {
                    // Get user roles
                    var userRoles = await _userManager.GetRolesAsync(user);

                    // Try to add user in other databases
                    var createUserInOtherDbsResult = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Create, jwt, userRoles.Contains("AE"));

                    // Failed to add user in other databases
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
                TenantName = user.Tenant.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserInitials = GetUserInitialsUtil.GetUserInitials(user.FirstName, user.LastName),
                AccessToken = jwt,
                RefreshToken = refreshToken,
                RTExpiresOn = refreshTokenExpiresOn
            };

            // UserSessionDto is ready
            _logger.LogInformation($"New session has been created successfully for {user.UserName}");
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "New session has been created successfully";
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
                VerificationCodeId = new Guid(),
                Email = createVerificationCodeDto.Email,
                RequestType = createVerificationCodeDto.RequestType

            },
            StatusCode = 200,
            Message = "Verification code has been sent to your email",
        };

        try
        {
            /*Possible RequestTypes: VerifyEmailAddress, TwoFA, ResetPwd, UnlockAccount*/

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
                    _logger.LogInformation($"Cannot fullfill VerifyEmailAddress request type " +
                    $"because User account already exits. " +
                    $"While creating verification code for " +
                    $"requestType - {requestType}, " +
                    $"username - {userName} and " +
                    $"device Id - {userAgent}");
                    return serviceResponse;
                }

                /*Locked account is allowed as user should be able to unlock account 
                 via creating code and verifing it*/

                // Account is disabled
                if (user.IsDisabled)
                {
                    _logger.LogInformation($"User account is disabled. " +
                        $"While creating verification code for " +
                        $"requestType - {requestType}, " +
                        $"username - {userName} and " +
                        $"device Id - {userAgent}");
                    return serviceResponse;
                }
            }

            // User not found
            if (user == null && requestType != VerificationCodeRequestTypesEnum.VerifyEmailAddress)
            {
                _logger.LogInformation($"User account not found. " +
                    $"While creating verification code for " +
                    $"requestType - {requestType}, " +
                    $"username - {userName} and " +
                    $"device Id - {userAgent}");
                return serviceResponse;
            }

            /*NOTE: We are not validating tenantId here since it is not required */

            // Create 6 secret code
            string secretCode = new Random().Next(100000, 999999).ToString();

            // Delete VerificationCodes (all expired + active for current userName and userAgent)
            await _authHelperService.DeleteVerificationCodes(userName, userAgent);

            // Create code's ExpiresOn
            var codeExpiresOn = DateTimeOffset.UtcNow.AddMinutes(
                _verificationCodeConfig.ValidityInMinutes);

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
                _logger.LogInformation("Context SaveChanges failed while creating " +
                    $"verification code for " +
                    $"requestType - {requestType}, " +
                    $"username - {userName} and " +
                    $"device Id - {userAgent}");
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
                    {"{{userFirstName}}", (user == null ? "" : user.FirstName) },
                    {"{{VerificationCode}}", verificationCode.SecretCode},
                    {"{{VerificationCodeValidityInMinutes}}", _verificationCodeConfig.ValidityInMinutes.ToString() }
                }))
            {
                _logger.LogError($"Error occurred while sending verification code " +
                    $"email to {createVerificationCodeDto.Email} and " +
                    $"request type {requestType}");
                /*Still moving forward because we are not going to inform user*/
            }

            // Task successful
            serviceResponse.Data.VerificationCodeId = verificationCode.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}