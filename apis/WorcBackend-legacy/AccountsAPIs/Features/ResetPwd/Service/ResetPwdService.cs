namespace AccountsAPIs.Services;

public class ResetPwdService : IResetPwdService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly IEmailService _emailService;
    private readonly HttpContext _httpContext;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ILogger<ResetPwdService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;
    private readonly IAuthHelperService _authHelperService;

    public ResetPwdService(
        UserManager<AccountUser> userManager,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<ResetPwdService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        EnvironmentConfig environmentConfig,
        IAuthService authService)
    {
        _userManager = userManager;
        _emailService = emailService;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authHelperService = authHelperService;
        _environmentConfig = environmentConfig;
        _authService = authService;
    }

    // Resets the password if the user has forgotten it or is setting it for the first time.
    public async Task<ServiceResponse<bool>> ResetPwdAsync(PwdResetDto pwdResetDto)
    {
        /*We are not going to inform the client about specific error due to security concerns*/

        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Unable to reset password. Please try again later"
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
            // Get Jwt cookie
            _httpContext.Request.Cookies.TryGetValue(CookieNamesEnum.AccessToken.ToString(), out var pwdResetJwt);

            // Jwt cookie not found
            if (pwdResetJwt == null)
            {
                return serviceResponse;
            }

            // Delete Jwt cookie bcz its a single use token
            _authHelperService.RemoveCookie(CookieNamesEnum.AccessToken.ToString());

            // Extract info from jwt
            var jwtInfo = JwtClaimsDataUtil.GetJwtClaimsData(
                pwdResetJwt,
                $"https://{_environmentConfig.AppBaseUrl}",
                $"https://{_environmentConfig.AppBaseUrl}",
                $"{_environmentConfig.JwtSecretKey}");

            // JwtInfo not found
            if (jwtInfo == null)
            {
                return serviceResponse;
            }

            // jwtInfo.TenantId || jwtInfo.UserName not found
            if (string.IsNullOrWhiteSpace(jwtInfo.TenantId) || string.IsNullOrWhiteSpace(jwtInfo.UserName))
            {
                return serviceResponse;
            }

            /*Get user (Includes Tenant and Roles) getting error: "The instance of entity 
            type 'User' cannot be tracked because another instance with the 
            same key value for {'Id'} is already being tracked. So, getting user using userManager*/

            // Get user by username
            var user = await _userManager.FindByNameAsync(jwtInfo.UserName);

            // User doesn't exist
            if (user == null)
            {
                return serviceResponse;
            }

            // Match found in ObsoletePwd table
            if (!await _authHelperService.DoesNewPwdPassObsoletePwdPolicy(pwdResetDto.NewPwd, user))
            {
                serviceResponse.Message = "New password does not meet all the requirements. Please try again";
                return serviceResponse;
            }

            // Reset NewPwd
            var pwdRemoveResult = await _userManager.RemovePasswordAsync(user);
            var addNewPwdResult = await _userManager.AddPasswordAsync(user, pwdResetDto.NewPwd);
            var newPwdSetOn = DateTimeOffset.UtcNow;

            // Reset-NewPwd job failed
            if (!pwdRemoveResult.Succeeded || !addNewPwdResult.Succeeded)
            {
                return serviceResponse;
            }

            // Saving pwd in ObsoletePwd failed
            if (!await _authHelperService.SavePwdInObsoletePwdList(user, pwdResetDto.NewPwd, newPwdSetOn))
            {
                return serviceResponse;
            }

            // Update user.PwdSetOn and Email Confirmed to true
            user.PwdSetOn = newPwdSetOn;
            user.LockoutEnd = null;
            user.EmailConfirmed = true; // Email is confirmed. If user is able to reset password. Accounts created via Admin will have this flag set to false and will be set to true when user resets password.
            _unitOfWork.AccountUserRepo.Update(user);

            // Terminate all sessions job failed
            if (!await LogoffFromAllSessions(pwdResetDto.LogoffFromAllSessions, user.Id, user.UserName))
                return serviceResponse;

            // Context SaveChanges job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Create placeholder values for email template
            var placeholderValues = new Dictionary<string, string>() { { "{{userFirstName}}", user.FirstName } };

            // Failed to send PwdReset email
            if (!await _emailService.SendEmailUsingTemplate(EmailTypesEnum.PwdReset, user.Email, placeholderValues))
            {
                /*Still moving forward as new password is already saved in the database*/
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Your password has been reset";
        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Logs off from all the sessions if checked by user at time of reset/change pwd

    public async Task<bool> LogoffFromAllSessions(bool logoffFromAllSessions, Guid userId, string userName, string? currentSessionId = null)
    {
        try
        {
            // if not requested
            if (!logoffFromAllSessions)
                return true;

            // Get all ActiveSessions for user
            var sessionIds = await _unitOfWork.ActiveSessionRepo
                                    .GetByConditionAsync(w => w.UserId == userId)
                                    .Select(s => s.Id)
                                    .ToListAsync();

            // currentSessionId is not null
            if (currentSessionId != null)
                sessionIds.Remove(new Guid(currentSessionId));

            // No active sessions found
            if (sessionIds.Count() == 0)
                return true;

            // Try to terminate -> result.StatusCode is not 200
            if ((await _authService.TerminateUserSessionsAsync(
                    userId,
                    userName,
                    TerminateSessionReasonsEnum.SessionTerminatedByUser,
                    sessionIds)).StatusCode != 200)
                return false;

            // Pass
            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

}