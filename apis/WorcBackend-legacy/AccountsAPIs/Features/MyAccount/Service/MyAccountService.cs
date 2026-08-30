using System.Runtime.CompilerServices;
using Npgsql.EntityFrameworkCore.PostgreSQL.Query.ExpressionTranslators.Internal;
using Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.Mapping;

namespace AccountsAPIs.Services;

public class MyAccountService : IMyAccountService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly SignInManager<AccountUser> _signInManager;
    private readonly HttpContext _httpContext;
    private readonly ILogger<MyAccountService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;
    private readonly IAuthHelperService _authHelperService;
    private readonly IEmailService _emailService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly AppDefaultConfig _appDefaultConfig;
    private readonly string _jwt;
    private readonly string _userName;
    private readonly Guid _sessionId;
    private readonly Guid _userId;

    const string invalidcredentials = "Invalid credentials";
    const string userDoesNotExists = "User does not exists";
    const string userNotFoundTemplate = "{methodName}: User not found for username {_userName}";

    public MyAccountService(
        UserManager<AccountUser> userManager,
        SignInManager<AccountUser> signInManager,
        IHttpContextAccessor httpContextAccessor,
        ILogger<MyAccountService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        IAuthService authService,
        EnvironmentConfig environmentConfig,
        AppDefaultConfig appDefaultConfig,
        IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, message: "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authService = authService;
        _authHelperService = authHelperService;
        _emailService = emailService;
        _environmentConfig = environmentConfig;
        _appDefaultConfig = appDefaultConfig;
        _jwt = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? "jwt-not-found";
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
        _sessionId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("sid") ?? Guid.Empty.ToString());
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Gets user's current session without JWT to view latest user's info
    public async Task<ServiceResponse<UserSessionDto>> GetMySessionAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<UserSessionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get user
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => w.UserName == _userName)
                    .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                    .AsNoTracking()
                    .AsSplitQuery()
                    .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // Try to get user session
            var session = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.Id == _sessionId && w.UserId == user.Id)
                .SingleOrDefaultAsync();

            // User session doesn't exist
            if (session == null)
            {
                serviceResponse.Message = "User session does not exist";
                return serviceResponse;
            }

            // Try to retrieve the access token from the request cookies
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.AccessToken.ToString(), out var accessToken);

            // Try to retrieve the tenant by id
            var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == user.TenantId).FirstOrDefaultAsync();

            var userSessionDto = new UserSessionDto()
            {
                TenantName = user.Tenant.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserInitials = GetUserInitialsUtil.GetUserInitials(user.FirstName, user.LastName),
                AccessToken = accessToken,
                RefreshToken = session.RefreshToken,
                RTExpiresOn = session.SessionExpiresOn,
                Country = tenant != null ? tenant.Country.ToString() : "NA",
                PlatformVersion = _appDefaultConfig.PlatformVersion
            };

            // Task successful
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Session retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> LogOffFromCurrentSessionAsync()
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Failed to logoff. Please try again later"
        };

        try
        {
            // Set method name
            var methodName = nameof(LogOffFromCurrentSessionAsync);

            // Get current active session
            var currentSession = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.Id == _sessionId && w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Session not found
            if (currentSession == null)
            {
                return serviceResponse;
            }

            // Get user request's deviceId
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();

            // TODO: Uncomment to check for DeviceId mismatch when needed
            // // DeviceId did not match
            // if (currentSession.DeviceId != userAgent)
            // {
            //     return serviceResponse;
            // }

            // Add sessionId to list (TerminateUserSessionsAsync accepts list of sessionId)
            var sessionIds = new List<Guid> { _sessionId };

            // Terminate current sessions
            var terminateSessionResult = await _authService.TerminateUserSessionsAsync(_userId, _userName, TerminateSessionReasonsEnum.SessionTerminatedByUser, sessionIds);

            // TerminateSession job failed
            if (terminateSessionResult.StatusCode != 200)
            {
                return serviceResponse;
            }

            // Signout using SignInManager
            await _signInManager.SignOutAsync();

            // Set all cookies to blank
            _authHelperService.RemoveCookie(CookieNamesEnum.SessionId.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.AccessToken.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.RefreshToken.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.UserName.ToString());

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "You have been logged off successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);

            return serviceResponse;
        }

        return serviceResponse;
    }

    // Refreshes the user's session for the requested device.
    public async Task<ServiceResponse<UserSessionDto>> RefreshUserSessionAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<UserSessionDto>
        {
            Data = null,
            StatusCode = 401,
            Message = "Unable to refresh the session"
        };

        try
        {
            // Get SessionId, Username, RefreshToken and User-Agent
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.SessionId.ToString(), out var sessionIdString);
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.UserName.ToString(), out var userName);
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.RefreshToken.ToString(), out var refreshToken);
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();

            // Set all cookies to blank
            _authHelperService.RemoveCookie(CookieNamesEnum.SessionId.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.AccessToken.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.RefreshToken.ToString());
            _authHelperService.RemoveCookie(CookieNamesEnum.UserName.ToString());

            // Something is missing
            if (sessionIdString == null || userName == null || userAgent == null)
            {
                serviceResponse.Message = "Unable to refresh the session";
                return serviceResponse;
            }

            // RefreshToken not found
            if (refreshToken == null)
            {

                serviceResponse.Message = "Session has expired";
                return serviceResponse;
            }

            // Get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => EF.Functions.ILike(userName, w.UserName))
                .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                    .AsNoTracking()
                    .AsSplitQuery()
                    .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                serviceResponse.Message = invalidcredentials;
                return serviceResponse;
            }

            // Tenant is null/disabled/expired
            if (!_authHelperService.IsUserTenantValid(user.Tenant, user.UserName))
            {
                serviceResponse.Message = "Not able to retrieve your tenant's details. Please contact support administrator";
                return serviceResponse;
            }

            // Account is locked
            if (user.LockoutEnd > DateTimeOffset.UtcNow)
            {
                serviceResponse.Message = "Your account is locked. Please contact support administrator";
                return serviceResponse;
            }

            // Account is disabled
            if (user.IsDisabled)
            {
                serviceResponse.Message = "Your account is disabled. Please contact support administrator";
                return serviceResponse;
            }

            // Password has expired
            if (!user.Tenant.IsPwdNeverExpiresEnabled && (DateTimeOffset.UtcNow - user.PwdSetOn)?.Days > user.Tenant.DaysBeforePwdExpires)
            {
                /********IMPORTANCT NOTE********
                DO NOT CHANGE the message's part "Your password has
                been expired" as it has to match on frontend side
                ********IMPORTANCT NOTE********/
                serviceResponse.Message = "Your password has been expired. Please reset it to use your account";
                return serviceResponse;
            }

            // Get session
            var sessionId = new Guid(sessionIdString);
            var activeSession = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.Id == sessionId && w.UserId == user.Id)
                .SingleOrDefaultAsync();

            // Session not found
            if (activeSession == null)
            {
                serviceResponse.Message = invalidcredentials;
                return serviceResponse;
            }

            // TODO: Uncomment the DeviceId mismatch check when needed
            // // DeviceId did not match
            // if (activeSession.DeviceId != userAgent)
            // {
            //     _logger.LogInformation("Log:10 DeviceId mismatch: expected {ExpectedDeviceId}, found {ActualDeviceId} for session {SessionId} and user {UserName}", activeSession.DeviceId, userAgent, activeSession.Id, userName);
            //     serviceResponse.Message = invalidcredentials;
            //     return serviceResponse;
            // }

            // // RefreshToken did not match
            // if (activeSession.RefreshToken != refreshToken)
            // {
            //     _logger.LogInformation("Log:11 RefreshToken mismatch for session {SessionId} and user {UserName}. Expected {ExpectedRefreshToken}, found {ActualRefreshToken}", activeSession.Id, userName, activeSession.RefreshToken, refreshToken);
            //     serviceResponse.Message = invalidcredentials;
            //     return serviceResponse;
            // }

            /*No need to check refreshToken expiry bcz 
            cookie won't exist if refreshToken is expired*/

            // Get Jwt and RefreshToken validity config
            var jwtExpiresOn = DateTimeOffset.UtcNow.AddMinutes(_environmentConfig.JwtValidityInMinutes);
            var refreshTokenExpiresOn = DateTimeOffset.UtcNow.AddDays(_environmentConfig.JwtRefreshTokenValidityInDays);

            // Retrieve the tenant's subscription along with the associated plan details.
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                 .GetByConditionAsync(w => w.TenantId == user.TenantId && w.IsActive)
                 .Include(i => i.Plan)
                 .FirstOrDefaultAsync();

            // Extract the current plan type from the subscription, if available.
            string? currentPlan = tenantSubscription?.Plan?.Type.ToString();

            // Create Jwt string
            var jwt = _authHelperService.CreateJwt(user, jwtExpiresOn, false, sessionId, currentPlan);

            // Create new RefreshToken
            var newRefreshToken = _authHelperService.CreateRefreshToken();

            // Update info of activeSession instance
            activeSession.RefreshToken = newRefreshToken;
            activeSession.SessionExpiresOn = refreshTokenExpiresOn;
            activeSession.LastRefreshOn = DateTimeOffset.UtcNow;

            // Update ActiveSession with concurrency handling
            // This handles React Strict Mode causing duplicate refresh requests
            try
            {
                _unitOfWork.ActiveSessionRepo.Update(activeSession);

                // Update ActiveSession failed
                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                // Another concurrent request already refreshed this session (e.g., React Strict Mode double-call)
                // Re-fetch the updated session and use its tokens

                // Re-fetch the session that was updated by the concurrent request
                activeSession = await _unitOfWork.ActiveSessionRepo
                    .GetByConditionAsync(w => w.Id == sessionId && w.UserId == user.Id)
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

                if (activeSession == null)
                {
                    serviceResponse.Message = invalidcredentials;
                    return serviceResponse;
                }

                // Use the tokens from the already-refreshed session
                newRefreshToken = activeSession.RefreshToken;
                refreshTokenExpiresOn = activeSession.SessionExpiresOn;
            }

            // Append SessionId, Jwt/AccessToken, RefreshToken, and Username to cookies
            _authHelperService.SetCookie(CookieNamesEnum.SessionId.ToString(), activeSession.Id.ToString(), refreshTokenExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.AccessToken.ToString(), jwt, jwtExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.RefreshToken.ToString(), newRefreshToken, refreshTokenExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.UserName.ToString(), user.UserName, refreshTokenExpiresOn);

            // Try to retrieve tenant by id
            var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == user.TenantId).FirstOrDefaultAsync();

            // Create UserSessionDto
            var userSessionDto = new UserSessionDto()
            {
                TenantName = user.Tenant.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserInitials = GetUserInitialsUtil.GetUserInitials(user.FirstName, user.LastName),
                AccessToken = jwt,
                RefreshToken = refreshToken,
                RTExpiresOn = refreshTokenExpiresOn,
                Country = tenant != null ? tenant.Country.ToString() : "NA",
                PlatformVersion = _appDefaultConfig.PlatformVersion
            };

            // Check if user is associated with an organization (tenant)
            if (user.Tenant == null || user.Tenant.Type == TenantTypesEnum.Unspecified)
            {
                serviceResponse.Message = "Complete organization setup to continue.";
            }
            else
            {
                // Query current tenant's subscription
                var subscription = await _unitOfWork.TenantSubscriptionRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == user.TenantId && w.IsActive
                    )
                    .SingleOrDefaultAsync();

                // free Starter plan automatically once subscription is expired. In that case also there will be always one active subscription.


                // Check if a valid subscription was found
                if (subscription == null || subscription.Status == SubscriptionStatusTypesEnum.Initiated)
                {
                    _logger.LogWarning("No active subscription found for user {UserId} in tenant {TenantId}.", user.Id, user.TenantId);
                    serviceResponse.Message = "Tenant has no active subscription.";
                }
                else
                {
                    serviceResponse.Message = "Session has been refreshed successfully.";
                }
            }

            // UserSessionDto is ready
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update user's passwrod after checking old password.
    public async Task<ServiceResponse<bool>> UpdatePwdAsync(PwdUpdateDto pwdUpdateDto)
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Failed to update your password. Please try again later"
        };

        try
        {
            // Set method name
            var methodName = nameof(UpdatePwdAsync);

            // Get user
            var user = await _userManager.FindByNameAsync(_userName);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // Check if old password is correct
            var result = await _userManager.CheckPasswordAsync(user, pwdUpdateDto.OldPwd);

            // Old password is incorrect
            if (!result)
            {
                // Increase lockout count
                user.AccessFailedCount++;
                user.LockoutEnd = user.AccessFailedCount >= _environmentConfig.LockoutMaxFailedAccessAttempts
                    ? DateTimeOffset.UtcNow.AddMinutes(_environmentConfig.DefaultLockoutTimeSpanInMinutes)
                    : user.LockoutEnd;

                // Update user
                await _userManager.UpdateAsync(user);

                serviceResponse.Message = "Old password is incorrect";
                return serviceResponse;
            }

            // User is disabled
            if (user.IsDisabled)
            {
                serviceResponse.Message = "Your account is disabled. Please contact support adminstrator";
                return serviceResponse;
            }

            // User is locked
            if (user.LockoutEnd > DateTimeOffset.UtcNow)
            {
                serviceResponse.Message = "Your account is locked. Please contact support adminstrator";
                return serviceResponse;
            }

            // Match found in ObsoletePwd table
            if (!await _authHelperService.DoesNewPwdPassObsoletePwdPolicy(pwdUpdateDto.NewPwd, user))
            {
                serviceResponse.Message = "New password does not meet all the requirements. Please try again";
                return serviceResponse;
            }

            // Update password
            var pwdRemoveResult = await _userManager.RemovePasswordAsync(user);
            var addNewPwdResult = await _userManager.AddPasswordAsync(user, pwdUpdateDto.NewPwd);

            // Reset-NewPwd job failed
            if (!pwdRemoveResult.Succeeded || !addNewPwdResult.Succeeded)
            {
                return serviceResponse;
            }

            // Set new password set on date
            var newPwdSetOn = DateTimeOffset.UtcNow;

            // Save old password in ObsoletePwds table
            if (!await _authHelperService.SavePwdInObsoletePwdList(user, pwdUpdateDto.NewPwd, newPwdSetOn))
            {
                return serviceResponse;
            }

            // Update last password change date
            user.PwdSetOn = newPwdSetOn;
            await _userManager.UpdateAsync(user);

            // User asked to logoff from all sessions
            if (pwdUpdateDto.LogoffFromOtherSessions)
            {
                // Get all ActiveSessions for user except current session
                var sessionIds = await _unitOfWork.ActiveSessionRepo
                    .GetByConditionAsync(w => w.UserId == user.Id && w.Id != _sessionId)
                    .Select(s => s.Id)
                    .ToListAsync();

                // Terminate all sessions
                var terminateSessionsResult = await _authService.TerminateUserSessionsAsync(user.Id, _userName, TerminateSessionReasonsEnum.SessionTerminatedByUser, sessionIds);

                // TerminateSessions job failed
                if (terminateSessionsResult.StatusCode != 200)
                {
                    return serviceResponse;
                }
            }

            // Context SaveChanges job failed
            if (!await _unitOfWork.SaveAsync(true))
            {
                return serviceResponse;
            }

            // Create placeholder values for email template
            var placeholderValues = new Dictionary<string, string>() { { "{{userFirstName}}", user.FirstName } };

            // Failed to send PwdReset email
            if (!await _emailService.SendEmailUsingTemplate(EmailTypesEnum.PwdUpdated, user.Email, placeholderValues))
            {
                /*Still moving forward as new password is already saved in the database*/
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your password has been updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);

            return serviceResponse;
        }

        return serviceResponse;
    }

    //Update user's first and last name
    public async Task<ServiceResponse<NameUpdateDto>> UpdateNameAsync(NameUpdateDto nameUpdateDto)
    {
        //Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<NameUpdateDto>()
        {
            Data = null,
            Message = "Failed to update your name. Please try again later"
        };

        try
        {
            //set method name
            var methodName = nameof(UpdateNameAsync);

            // Get user
            var user = await _userManager.FindByNameAsync(_userName);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // Update account User using UserManager
            user.FirstName = nameUpdateDto.FirstName;
            user.LastName = nameUpdateDto.LastName;
            var updateUserResult = await _userManager.UpdateAsync(user);

            // User Update-Job failed
            if (!updateUserResult.Succeeded)
            {
                serviceResponse.Message = "User's name update failed";
                return serviceResponse;
            }

            //Update user in other databases
            var response = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Update, _jwt);

            if (!response)
            {
                serviceResponse.Message = "User's name update failed in other databases";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = nameUpdateDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your name has been updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);

            return serviceResponse;
        }
        return serviceResponse;
    }

    // Update user's email
    public async Task<ServiceResponse<UserSessionDto>> UpdateEmailAsync(EmailUpdateDto emailUpdateDto)
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<UserSessionDto>()
        {
            Data = null,
            Message = "Failed to update your email. Please try again later"
        };

        try
        {
            // Set method name for logging purposes
            var methodName = nameof(UpdateEmailAsync);

            // Get the current user using their username
            var user = await _userManager.FindByNameAsync(_userName);

            // Check if the user exists, return error message if not
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // Get the verification code based on the provided ID
            var verificationCode = await _unitOfWork.VerificationCodeRepo
                .GetByConditionAsync(w => w.Id == emailUpdateDto.VerificationCodeId)
                .SingleOrDefaultAsync();

            // Handle case where the verification code is not found
            if (verificationCode == null)
            {
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }

            // Check if the provided secret code matches and has not expired
            var verificationCodeMatches = verificationCode.SecretCode.Equals(emailUpdateDto.SecretCode)
                && DateTimeOffset.UtcNow < verificationCode.ExpiresOn;

            // Delete the verification code after use to prevent re-use
            _unitOfWork.VerificationCodeRepo.Delete(verificationCode);
            await _unitOfWork.SaveAsync();

            // If the verification code does not match or is expired, return error message
            if (!verificationCodeMatches)
            {
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }

            // Update the user's email and username to the new email address
            user.Email = emailUpdateDto.Email;
            user.UserName = emailUpdateDto.Email;

            // Generate a token for email change and attempt to change the email
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, emailUpdateDto.Email);
            var identityResult = await _userManager.ChangeEmailAsync(user, emailUpdateDto.Email, token);

            // If the email change fails, log and return error message
            if (!identityResult.Succeeded)
            {
                serviceResponse.Message = "User's email update failed";
                return serviceResponse;
            }

            // Update the user's security stamp to invalidate any old cookies
            await _userManager.UpdateSecurityStampAsync(user);

            // Refresh the sign-in session to apply the new email
            await _signInManager.RefreshSignInAsync(user);

            // Attempt to update the user data in other connected databases
            var response = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Update, _jwt);

            // If updating in other databases fails, return error message
            if (!response)
            {
                serviceResponse.Message = "User's email update failed in other databases";
                return serviceResponse;
            }



            // Get any active sessions for the user and delete them
            var activeSessions = await _unitOfWork.ActiveSessionRepo.GetByConditionAsync(w => w.UserId == user.Id).ToListAsync();
            if (activeSessions.Any())
            {
                _unitOfWork.ActiveSessionRepo.Delete(activeSessions);
                if (!await _unitOfWork.SaveAsync())
                {
                }
            }
            // Fetch the updated user with their tenant details
            user = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => EF.Functions.ILike(user.Email, w.UserName))
                .AsSplitQuery()
                .Include(i => i.Tenant)
                .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Create a new session for the user with the updated email
            var activeSession = await _authService.CreateUserSessionAsync(user);
            if (activeSession.StatusCode != 200)
            {
                return serviceResponse;
            }

            serviceResponse.Data = activeSession.Data;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your email has been updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }

        // Return the service response, which will be success or failure based on the flow
        return serviceResponse;
    }

    //Update user's two factor authentication
    public async Task<ServiceResponse<Toggle2FADto>> Toggle2FAAsync(Toggle2FADto toggle2FADto)
    {
        //Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<Toggle2FADto>()
        {
            Data = null,
            Message = "Failed to update two factor aunthentication. Please try again later"
        };

        try
        {
            var methodName = nameof(UpdateEmailAsync);

            // Get user
            var user = await _userManager.FindByNameAsync(_userName);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // Verifty email to disable two factor authentication
            if (!toggle2FADto.TwoFactorEnabled)
            {
                // Get Verification secret code
                var verificationCode = await _unitOfWork.VerificationCodeRepo
                           .GetByConditionAsync(w => w.Id == toggle2FADto.VerificationCodeId)
                           .SingleOrDefaultAsync();

                // Verification secret code not found
                if (verificationCode == null)
                {
                    serviceResponse.Message = "Failed to verify code. Please try again";
                    return serviceResponse;
                }

                // Match Verification secret code
                var verificationCodeMatches = verificationCode.SecretCode.Equals(toggle2FADto.SecretCode)
                    && DateTimeOffset.UtcNow < verificationCode.ExpiresOn;

                // Delete Verification secret Code
                _unitOfWork.VerificationCodeRepo.Delete(verificationCode);
                await _unitOfWork.SaveAsync();

                // Secret code did not match
                if (!verificationCodeMatches)
                {
                    serviceResponse.Message = "Failed to verify code. Please try again";
                    return serviceResponse;
                }
            }

            // Update account User using UserManager
            user.TwoFactorEnabled = toggle2FADto.TwoFactorEnabled;
            var updateUserResult = await _userManager.UpdateAsync(user);

            // User Update-Job failed
            if (!updateUserResult.Succeeded)
            {
                serviceResponse.Message = "User's two factor authentication update failed";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = toggle2FADto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your two factor authentication has been updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);

            return serviceResponse;
        }
        return serviceResponse;
    }

    // Gets user's active sessions to view latest user's info
    public async Task<ServiceResponse<IEnumerable<ActiveSessionDto>>> GetAllActiveSessionsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<ActiveSessionDto>>
        {
            Data = null,
            Message = "An error occurred while retrieving active sessions",

        };

        try
        {
            // Fetch all active sessions for the user that have not expired yet
            var activeSessions = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.UserId == _userId && w.SessionExpiresOn > DateTimeOffset.UtcNow)
                .ToListAsync();

            // Check condition if no active session
            if (!activeSessions.Any())
            {
                serviceResponse.Message = "No active sessions found for the specified user.";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Map the ActiveSession entities to ActiveSessionDto using Mapster
            serviceResponse.Data = activeSessions
                .Adapt<IEnumerable<ActiveSessionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Active sessions retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);

            return serviceResponse;
        }

        return serviceResponse;
    }

    // Gets user's 2fa-status to view latest user's info
    public async Task<ServiceResponse<bool>> GetCurrent2FAStatusAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "An error occurred while retrieving Two-factor authentication status"
        };

        try
        {
            // Fetch the user from the database using userId
            var user = await _unitOfWork.AccountUserRepo.GetByConditionAsync(w => w.Id == _userId).FirstOrDefaultAsync();

            // If the user is not found, return an error response
            if (user == null)
            {
                serviceResponse.Message = "User not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // If the user is found, set the Data property to the TwoFactorEnabled value
            serviceResponse.Data = user.TwoFactorEnabled;

            // Set success message and status code
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Two-factor authentication status retrieved successfully";
        }
        catch (Exception ex)
        {

            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);

            return serviceResponse;
        }

        return serviceResponse;
    }

    //Delete user account 
    public async Task<ServiceResponse<bool>> DeleteUserAccountAsync(DeleteUserAccountDto deleteUserAccountDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete user. Please try again"
        };

        try
        {
            // Get User By Name
            var user = await _userManager.FindByNameAsync(_userName);

            // User not found
            if (user == null)
            {
                serviceResponse.Message = "User not found";
                return serviceResponse;
            }

            // Get Verification secret code
            var verificationCode = await _unitOfWork.VerificationCodeRepo
            .GetByConditionAsync(w => w.Id == deleteUserAccountDto.VerificationCodeId)
            .SingleOrDefaultAsync();

            // Verification secret code not found
            if (verificationCode == null)
            {
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }

            // Match Verification secret code
            var verificationCodeMatches = verificationCode.SecretCode.Equals(deleteUserAccountDto.SecretCode)
                && DateTimeOffset.UtcNow < verificationCode.ExpiresOn;

            // Delete Verification secret Code
            _unitOfWork.VerificationCodeRepo.Delete(verificationCode);
            await _unitOfWork.SaveAsync();

            // Secret code did not match
            if (!verificationCodeMatches)
            {
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }
            // Delete active sessions
            var activeSessions = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.UserId == user.Id && w.SessionExpiresOn > DateTimeOffset.UtcNow)
                .ToListAsync();

            if (activeSessions.Any())
                _unitOfWork.ActiveSessionRepo.Delete(activeSessions);

            // Delete obsolete password record
            var obsoletePwd = await _unitOfWork.ObsoletePwdRepo
                .GetByConditionAsync(w => w.UserId == user.Id)
                .FirstOrDefaultAsync();

            if (obsoletePwd != null)
                _unitOfWork.ObsoletePwdRepo.Delete(obsoletePwd);

            // Delete session logs
            var sessionLogs = await _unitOfWork.SessionLogRepo.GetByConditionAsync(w => w.UserId == user.Id).ToListAsync();
            if (sessionLogs.Any())
                _unitOfWork.SessionLogRepo.Delete(sessionLogs);

            // Delete user
            var deleteUserResult = await _userManager.DeleteAsync(user);
            if (!deleteUserResult.Succeeded)
            {
                return serviceResponse;
            }

            // Try to delete user in other databases
            var deleteUserInOtherDbsResult = await _authHelperService.DeleteUserInOtherDbsAsync(user.Id, _jwt);
            if (!deleteUserInOtherDbsResult)
            {
                return serviceResponse;
            }
            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User deleted successfully";
        }

        catch (Exception ex)
        {
            serviceResponse.Message = "An error occurred while deleting the user";
        }
        return serviceResponse;
    }

    //Update user's profile details updateUserProfileDto
    public async Task<ServiceResponse<UserProfileDto>> UpdateUserProfileAsync(UserProfileDto userProfileDto)
    {
        // Initialize ServiceResponse with failed response by default
        var serviceResponse = new ServiceResponse<UserProfileDto>()
        {
            Data = null,
            Message = "Failed to update your profile. Please try again later"
        };

        try
        {
            // Set method name for logging purposes
            var methodName = nameof(UpdateUserProfileAsync);

            // Get the user from the UserManager using the username
            var user = await _userManager.FindByNameAsync(_userName);

            // If user doesn't exist, log and return a failure response
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // If DateOfBirth is provided, update the user's DateOfBirth
            if (userProfileDto.DateOfBirth.HasValue)
                user.DateOfBirth = userProfileDto.DateOfBirth.Value;

            // Update user's other details like First Name, Last Name, Phone Number, Gender, and Country
            user.FirstName = userProfileDto.FirstName;
            user.LastName = userProfileDto.LastName;
            user.PhoneNumber = userProfileDto.PhoneNumber;
            user.Gender = userProfileDto.Gender;
            user.Country = userProfileDto.Country;

            // Attempt to update the user information in the UserManager
            var updateUserResult = await _userManager.UpdateAsync(user);

            // If the update fails, log the failure and return a failure response
            if (!updateUserResult.Succeeded)
            {
                serviceResponse.Message = "User's profile update failed";
                return serviceResponse;
            }

            //Update user in other databases
            var response = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Update, _jwt);

            if (!response)
            {
                serviceResponse.Message = "User's name update failed in other databases";
                return serviceResponse;
            }

            serviceResponse.Data = userProfileDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your profile has been updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }

        // Return the final service response (either success or failure)
        return serviceResponse;
    }

    //Update user's profile details updateUserProfileDto
    public async Task<ServiceResponse<UserProfileDto>> GetUserProfileAsync()
    {
        //Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<UserProfileDto>()
        {
            Data = null,
            Message = "Failed to get your profile. Please try again later"
        };

        try
        {

            // Get user
            var user = await _userManager.FindByNameAsync(_userName);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, "GetUserProfileAsync()", _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }
            var userProfileDetails = new UserProfileDto
            {
                AvatarSrc = user.AvatarSrc,
                FirstName = user.FirstName,
                LastName = user.LastName,
                DateOfBirth = user.DateOfBirth,
                PhoneNumber = user.PhoneNumber,
                Gender = user.Gender,
                Country = user.Country
            };

            // Task successful
            serviceResponse.Data = userProfileDetails;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your profile has been fetched successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }
        return serviceResponse;
    }

    // acccounts-api/tenant/user/
    public async Task<ServiceResponse<UserBillingAddressDto>> GetUserBillingAddressAsync()
    {
        //Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<UserBillingAddressDto>()
        {
            Data = null,
            Message = "Failed to fetch your tenant profile. Please try again later"
        };

        try
        {
            //set method name
            var methodName = nameof(GetUserBillingAddressAsync);

            // Get user
            var user = await _userManager.FindByNameAsync(_userName);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // Get default Tenant 
            var defaultTenant = await _unitOfWork.TenantRepo
                                        .GetByConditionAsync(w => w.Id == user.TenantId)
                                        .SingleOrDefaultAsync();

            UserBillingAddressDto getUserTenantInfoDto;
            if (defaultTenant.Name.Equals(GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers)))
            {

                //if the use is individual then get the billing address of the user
                var userBillingAddress = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.CreatedByUserId == user.Id)
                .FirstOrDefaultAsync();

                getUserTenantInfoDto = new()
                {
                    IsIndividual = true,
                    AddressType = AddressTypeEnum.Official,
                    AddressLine1 = userBillingAddress?.AddressLine1,
                    AddressLine2 = userBillingAddress?.AddressLine2,
                    City = userBillingAddress?.City,
                    Country = userBillingAddress?.Country.ToString(),
                    StateOrProvince = userBillingAddress?.State,
                    //no designation and tenant for indi user
                };
                serviceResponse.Message = userBillingAddress is null ? "Please add the address of billing." : "tenant info fetched succesfully.";
            }
            else
            {
                var addressOfTenant = await _unitOfWork.BillingDetailRepo
                .GetAllAsync()
                .FirstOrDefaultAsync();
                getUserTenantInfoDto = new()
                {
                    IsIndividual = false,
                    AddressType = AddressTypeEnum.Official,
                    AddressLine1 = addressOfTenant?.AddressLine1,
                    AddressLine2 = addressOfTenant?.AddressLine2,
                    City = addressOfTenant?.City,
                    Country = addressOfTenant?.Country.ToString(),
                    StateOrProvince = addressOfTenant?.State,
                    //TODO change when the designation when data is availabl
                    Designation = string.Empty,
                    TenantName = defaultTenant.Name
                };

                serviceResponse.Message = addressOfTenant is null ? "Please add the address of tenant." : "tenant info fetched succesfully.";
            }
            serviceResponse.Data = getUserTenantInfoDto;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }
        return serviceResponse;
    }

    // acccounts-api/tenant/update-user/
    public async Task<ServiceResponse<UserBillingAddressDto>> UpdateUserBillingAddressAsync(UserBillingAddressDto userTenantInfoDto)
    {
        //Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<UserBillingAddressDto>()
        {
            Data = null,
            Message = "Failed to update your tenant profile. Please try again later"
        };

        try
        {
            //set method name
            var methodName = nameof(UpdateUserBillingAddressAsync);

            // Get user
            var user = await _userManager.FindByNameAsync(_userName);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            if (userTenantInfoDto is null)
            {
                serviceResponse.Message = "Please provide proper details to update the tenant account";
                serviceResponse.StatusCode = 400;
                return serviceResponse;
            }

            // Get default Tenant 
            var defaultTenant = await _unitOfWork.TenantRepo
                                        .GetByConditionAsync(w => w.Id == user.TenantId)
                                        .SingleOrDefaultAsync();

            var isIndie = defaultTenant?.Name.Equals(GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers));

            if (isIndie != null && !isIndie.Value)
            {
                serviceResponse.Message = "Billing address of tenant must be update by the authorized user. ";
                serviceResponse.StatusCode = 400;
                return serviceResponse;
            }

            serviceResponse.Message = "tenant info updated succesfully.";
            serviceResponse.Data = userTenantInfoDto;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }
        return serviceResponse;
    }

    // acccounts-api/tenant/deactivate/
    public async Task<ServiceResponse<bool>> DeactivateAccountAsync(DeactivateUserAccountDto deactivateUserAccountDto)
    {
        //Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Failed to deactivate your account. Please try again later"
        };

        try
        {
            //set method name
            var methodName = nameof(DeactivateAccountAsync);

            // Get user
            var user = await _userManager.FindByNameAsync(_userName);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // Get Verification secret code
            var verificationCode = await _unitOfWork.VerificationCodeRepo
            .GetByConditionAsync(w => w.Id == deactivateUserAccountDto.VerificationCodeId)
            .SingleOrDefaultAsync();

            // Verification secret code not found
            if (verificationCode == null)
            {
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }

            // check the user password
            var isCorrectPWD = await _userManager.CheckPasswordAsync(user, deactivateUserAccountDto.Password);


            // return if the user password is not correct
            if (!isCorrectPWD)
            {
                serviceResponse.Message = "Password is incorrect. Please try again";
                return serviceResponse;
            }

            // Match Verification secret code
            var verificationCodeMatches = verificationCode.SecretCode.Equals(deactivateUserAccountDto.SecretCode)
                && DateTimeOffset.UtcNow < verificationCode.ExpiresOn;

            // Delete Verification secret Code
            _unitOfWork.VerificationCodeRepo.Delete(verificationCode);
            await _unitOfWork.SaveAsync();

            // Secret code did not match
            if (!verificationCodeMatches)
            {
                serviceResponse.Message = "Failed to verify code. Please try again";
                return serviceResponse;
            }

            // Get all ActiveSessions for user
            var sessionIds = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.UserId == user.Id)
                .Select(s => s.Id)
                .ToListAsync();

            //check if the user is asking for deactivation
            if (deactivateUserAccountDto.Deactivate)
            {
                // Terminate all sessions
                var terminateSessionsResult = await _authService.TerminateUserSessionsAsync(user.Id, _userName, TerminateSessionReasonsEnum.SessionTerminatedByUser, sessionIds);

                // TerminateSessions job failed
                if (terminateSessionsResult.StatusCode != 200)
                {
                    return serviceResponse;
                }
            }

            user.DeactivatedOn = deactivateUserAccountDto.Deactivate ? DateOnly.FromDateTime(DateTime.UtcNow).AddDays(10).ToDateTime(TimeOnly.MinValue).ToUniversalTime() : DateTime.MaxValue.ToUniversalTime();
            var updateUserResult = await _userManager.UpdateAsync(user);

            // User Update-Job failed
            if (!updateUserResult.Succeeded)
            {
                serviceResponse.Message = "User's account deactivation failed";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your account will be deactivated in 10 days.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);

            return serviceResponse;
        }
        return serviceResponse;
    }

    // Gets user's deactivation-status to view latest user's info
    public async Task<ServiceResponse<DeactivationStatusDto>> GetDeactivationStatusAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<DeactivationStatusDto>
        {
            Data = null,
            Message = "An error occurred while retrieving deactivation status"
        };

        try
        {
            // Fetch the user from the database using userId
            var user = await _unitOfWork.AccountUserRepo.GetByConditionAsync(w => w.Id == _userId).FirstOrDefaultAsync();

            // If the user is not found, return an error response
            if (user == null)
            {
                serviceResponse.Message = "User not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // If the user is found, set the Data property to the TwoFactorEnabled value
            serviceResponse.Data = new DeactivationStatusDto()
            {
                TimeRemains = user.DeactivatedOn,
                Deactivating = user.DeactivatedOn.ToUniversalTime() < DateTime.MaxValue.ToUniversalTime() && user.DeactivatedOn.ToUniversalTime() != DateTime.MinValue.ToUniversalTime() && user.DeactivatedOn.ToUniversalTime() != DateTime.MaxValue.ToUniversalTime()
            };

            // Set success message and status code
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "deactivation status retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }
        return serviceResponse;
    }
}