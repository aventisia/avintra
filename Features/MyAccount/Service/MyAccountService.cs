using Microsoft.Graph.Models;
using Microsoft.OpenApi.Any;

namespace AccountsAPIs.Services;

public class MyAccountService : IMyAccountService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly SignInManager<AccountUser> _signInManager;
    private readonly HttpContext _httpContext;
    private readonly ILogger<AuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;
    private readonly IAuthHelperService _authHelperService;
    private readonly IEmailService _emailService;
    private readonly IdentityConfig _identityConfig;
    private readonly JwtConfig _jwtConfig;
    private readonly string _jwt;
    private readonly string _userName;
    private readonly Guid _sessionId;
    private readonly Guid _userId;

    public MyAccountService(
        UserManager<AccountUser> userManager,
        SignInManager<AccountUser> signInManager,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuthService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        IAuthService authService,
        JwtConfig jwtConfig,
        IdentityConfig identityConfig,
        IEmailService emailService)
    {
        // Set _userName, _sessionId & _userId
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
        _sessionId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("sid") ?? Guid.Empty.ToString());
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _userManager = userManager;
        _signInManager = signInManager;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authService = authService;
        _authHelperService = authHelperService;
        _jwtConfig = jwtConfig;
        _identityConfig = identityConfig;
        _emailService = emailService;
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
                    .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation($"User not found for username {_userName}");
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Try to get user session
            var session = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => w.Id == _sessionId && w.UserId == user.Id)
                .SingleOrDefaultAsync();

            // User session doesn't exist
            if (session == null)
            {
                _logger.LogInformation($"User session not found for session Id {_sessionId}");
                serviceResponse.Message = "User session does not exist";
                return serviceResponse;
            }

            var userSessionDto = new UserSessionDto()
            {
                TenantName = user.Tenant.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserInitials = GetUserInitialsUtil.GetUserInitials(user.FirstName, user.LastName),
                AccessToken = "NA", // Not required to view the session
                RefreshToken = session.RefreshToken,
                RTExpiresOn = session.SessionExpiresOn
            };

            // Task successful
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Session retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
                _logger.LogInformation($"Active session not found for account {_userName} for session Id {_sessionId}");
                return serviceResponse;
            }

            // Get user request's deviceId
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();

            // DeviceId did not match
            if (currentSession.DeviceId != userAgent)
            {
                _logger.LogInformation($"DeviceId did not match for session {_sessionId} and account {_userName}");
                return serviceResponse;
            }

            // Add sessionId to list (TerminateUserSessionsAsync accepts list of sessionId)
            var sessionIds = new List<Guid> { _sessionId };

            // Terminate current sessions
            var terminateSessionResult = await _authService.TerminateUserSessionsAsync(_userId, _userName, TerminateSessionReasonsEnum.SessionTerminatedByUser, sessionIds);

            // TerminateSession job failed
            if (terminateSessionResult.StatusCode != 200)
            {
                _logger.LogError($"{methodName}: Not able to terminate current active sessions for session Id {_sessionId} and account {_userName}");
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
            _logger.LogInformation($"User has logged off successfully. Session Id - {_sessionId}, username - {_userName} and device Id - {userAgent}");
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "You have been logged off successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
                _logger.LogInformation($"{CookieNamesEnum.SessionId} or {CookieNamesEnum.UserName} or User-Agent not found");
                serviceResponse.Message = "Unable to refresh the session";
                return serviceResponse;
            }

            // RefreshToken not found
            if (refreshToken == null)
            {
                // Expired sessions will be deleted once user try to create new session via logging in
                _logger.LogInformation($"Session has expired for {sessionIdString} because {CookieNamesEnum.RefreshToken} not found");
                serviceResponse.Message = "Session has expired";
                return serviceResponse;
            }

            // Get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => w.UserName == userName)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation($"{userName} account not found");
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // Tenant is null/disabled/expired
            if (!_authHelperService.IsUserTenantValid(user.Tenant, user.UserName))
            {
                serviceResponse.Message = "Not able to retrieve your tenant's details. Please contact support adminstrator";
                return serviceResponse;
            }

            // Account is locked
            if (user.LockoutEnd > DateTimeOffset.UtcNow)
            {
                _logger.LogInformation($"{userName} account is locked");
                serviceResponse.Message = "Your account is locked. Please contact support adminstrator";
                return serviceResponse;
            }

            // Account is disabled
            if (user.IsDisabled)
            {
                _logger.LogInformation($"{userName} account is disabled");
                serviceResponse.Message = "Your account is disabled. Please contact support adminstrator";
                return serviceResponse;
            }

            // Password has expired
            if (user.Tenant.IsPwdNeverExpiresEnabled == false && (DateTimeOffset.UtcNow - user.PwdSetOn)?.Days > user.Tenant.DaysBeforePwdExpires)
            {
                _logger.LogInformation($"{userName} account's password has been expired");
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
                _logger.LogInformation($"Active session not found for account {userName}");
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // DeviceId did not match
            if (activeSession.DeviceId != userAgent)
            {
                _logger.LogInformation($"DeviceId did not match for session {activeSession.Id} and account {userName}");
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // RefreshToken did not match
            if (activeSession.RefreshToken != refreshToken)
            {
                _logger.LogInformation($"RefreshToken did not match for session {activeSession.Id} and account {userName}");
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            /*No need to check refreshToken expiry bcz 
            cookie won't exist if refreshToken is expired*/

            // Get Jwt and RefreshToken validity config
            var jwtExpiresOn = DateTimeOffset.UtcNow.AddMinutes(_jwtConfig.AuthJwtValidityInMinutes);
            var refreshTokenExpiresOn = DateTimeOffset.UtcNow.AddDays(_jwtConfig.RefreshTokenValidityInDays);

            // Create new Jwt string
            var jwt = _authHelperService.CreateJwt(user, jwtExpiresOn, false, sessionId);

            // Create new RefreshToken
            var newRefreshToken = _authHelperService.CreateRefreshToken();

            // Update info of activeSession instance
            activeSession.RefreshToken = newRefreshToken;
            activeSession.SessionExpiresOn = refreshTokenExpiresOn;
            activeSession.LastRefreshOn = DateTimeOffset.UtcNow;

            // Update ActiveSession
            _unitOfWork.ActiveSessionRepo.Update(activeSession);

            // Update-ActiveSession job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Context SaveChanges failed while refreshing active session for {user.UserName} and sessionId {sessionIdString}");
                serviceResponse.Message = "Something went wrong while refreshing session. Please try again later";
                return serviceResponse;
            }

            // Append SessionId, Jwt/AccessToken, RefreshToken and Username to cookies
            _authHelperService.SetCookie(CookieNamesEnum.SessionId.ToString(), activeSession.Id.ToString(), refreshTokenExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.AccessToken.ToString(), jwt, jwtExpiresOn);
            _authHelperService.SetCookie(CookieNamesEnum.RefreshToken.ToString(), newRefreshToken, refreshTokenExpiresOn);
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
            _logger.LogInformation($"Session has been refreshed successfully for {user.UserName} and session Id {sessionIdString}");
            serviceResponse.Data = userSessionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Session has been refreshed successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
                _logger.LogInformation($"{methodName}: User not found for username {_userName}");
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Check if old password is correct
            var result = await _userManager.CheckPasswordAsync(user, pwdUpdateDto.OldPwd);

            // Old password is incorrect
            if (!result)
            {
                // Increase lockout count
                user.AccessFailedCount++;
                user.LockoutEnd = user.AccessFailedCount >= _identityConfig.LockoutMaxFailedAccessAttempts
                    ? DateTimeOffset.UtcNow.AddMinutes(_identityConfig.DefaultLockoutTimeSpanInMinutes)
                    : user.LockoutEnd;

                // Update user
                await _userManager.UpdateAsync(user);

                // log and return
                _logger.LogInformation($"{methodName}: Old password is incorrect for username {_userName}");
                serviceResponse.Message = "Old password is incorrect";
                return serviceResponse;
            }

            // User is disabled
            if (user.IsDisabled)
            {
                _logger.LogInformation($"{methodName}: User account is disabled for username {_userName}");
                serviceResponse.Message = "Your account is disabled. Please contact support adminstrator";
                return serviceResponse;
            }

            // User is locked
            if (user.LockoutEnd > DateTimeOffset.UtcNow)
            {
                _logger.LogInformation($"{methodName}: User account is locked for username {_userName}");
                serviceResponse.Message = "Your account is locked. Please contact support adminstrator";
                return serviceResponse;
            }

            // Match found in ObsoletePwd table
            if (!await _authHelperService.DoesNewPwdPassObsoletePwdPolicy(pwdUpdateDto.NewPwd, user))
            {
                _logger.LogInformation($"{methodName}: A match found in obsolete passwords list for account {_userName}");
                serviceResponse.Message = "New password does not meet all the requirements. Please try again";
                return serviceResponse;
            }

            // Update password
            var pwdRemoveResult = await _userManager.RemovePasswordAsync(user);
            var addNewPwdResult = await _userManager.AddPasswordAsync(user, pwdUpdateDto.NewPwd);

            // Reset-NewPwd job failed
            if (!pwdRemoveResult.Succeeded || !addNewPwdResult.Succeeded)
            {
                _logger.LogError($"{methodName}: Usermanager is not able to set new password for account {_userName}");
                return serviceResponse;
            }

            // Set new password set on date
            var newPwdSetOn = DateTimeOffset.UtcNow;

            // Save old password in ObsoletePwds table
            if (!await _authHelperService.SavePwdInObsoletePwdList(user, pwdUpdateDto.NewPwd, newPwdSetOn))
            {
                _logger.LogError($"{methodName}: Not able to save new pwd in ObsoletePwd list for account {_userName}");
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
                    _logger.LogError($"{methodName}: Not able to terminate all sessions for account {_userName}");
                    return serviceResponse;
                }
            }

            // Context SaveChanges job failed
            if (!await _unitOfWork.SaveAsync(true))
            {
                _logger.LogError($"{methodName}: Context SaveChanges failed. While updating user passwrod for username - {_userName}");
                return serviceResponse;
            }

            // Create placeholder values for email template
            var placeholderValues = new Dictionary<string, string>() { { "{{userFirstName}}", user.FirstName } };

            // Failed to send PwdReset email
            if (!await _emailService.SendEmailUsingTemplate(EmailTypesEnum.PwdUpdated, user.Email, placeholderValues))
            {
                _logger.LogError($"{methodName}: Error occurred while sending password has been updated email to {user.Email}");
                /*Still moving forward as new password is already saved in the database*/
            }

            // Task successful
            _logger.LogInformation($"{methodName}: Password has been updated for account {_userName}");
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your password has been updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
                _logger.LogInformation("No active sessions found.");
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
            _logger.LogError(ex.ToString());
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

            _logger.LogError(ex.ToString());
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
                _logger.LogInformation("User not found");
                serviceResponse.Message = "User not found";
                return serviceResponse;
            }

             var isAE = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(user.Email) == "aventisia.com";
            if (isAE)
            {
                _logger.LogInformation("Failed to delete Aventisia user");
                serviceResponse.Message = "Unable to delete Aventisia user";
                return serviceResponse;
            }

            // Get Verification secret code
            var verificationCode = await _unitOfWork.VerificationCodeRepo
                       .GetByConditionAsync(w => w.Id == deleteUserAccountDto.VerificationCodeId)
                       .SingleOrDefaultAsync();

            // Verification secret code not found
            if (verificationCode == null)
            {
                _logger.LogInformation($"Verification code not found for email {user.Email}");
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
                _logger.LogInformation($"Invalid verification code for email {user.Email}");
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
                _logger.LogInformation("Failed to delete user");
                return serviceResponse;
            }

            // Try to delete user in other databases
            var deleteUserInOtherDbsResult = await _authHelperService.DeleteUserInOtherDbsAsync(user.Id, _jwt, false);
            if (!deleteUserInOtherDbsResult)
            {
                _logger.LogInformation("Failed to delete user in other databases");
                return serviceResponse;
            }
            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User deleted successfully";
        }

        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting the user");
            serviceResponse.Message = "An error occurred while deleting the user";
        }
        return serviceResponse;
    }

}




