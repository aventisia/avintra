namespace AccountsAPIs.Services;

public class LoginWithPwdService : ILoginWithPwdService
{
    private readonly SignInManager<AccountUser> _signInManager;
    private readonly UserManager<AccountUser> _userManager;
    private readonly ILogger<LoginWithPwdService> _logger;
    private readonly HttpContext _httpContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;
    private readonly EnvironmentConfig _environmentConfig;

    public LoginWithPwdService(
        SignInManager<AccountUser> signInManager,
        IHttpContextAccessor httpContextAccessor,
        ILogger<LoginWithPwdService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        UserManager<AccountUser> userManager,
        EnvironmentConfig environmentConfig)
    {
        _signInManager = signInManager;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authHelperService = authHelperService;
        _userManager = userManager;
        _environmentConfig = environmentConfig;
    }

    // Authenticates an individual or tenant's user using the provided username and password.
    public async Task<ServiceResponse<AccountUser>> AuthenticateUserAsync(PwdLoginDto pwdLoginDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AccountUser>
        {
            Data = null,
            StatusCode = 401,
            Message = "Invalid credentials"
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

            /*Get user (Includes Tenant and Roles) getting error: "The instance of entity 
            type 'User' cannot be tracked because another instance with the 
            same key value for {'Id'} is already being tracked. So, getting user using userManager*/

            // Get user
            var user = await _userManager.FindByEmailAsync(pwdLoginDto.Email);

            // User doesn't exist
            if (user == null)
            {
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // A passwordless user of a tenant whose single sign-on was disabled needs an actionable message
            if (user.PasswordHash == null)
            {
                var passwordlessUserTenant = user.TenantId.HasValue
                    ? await _unitOfWork.TenantRepo
                        .GetByConditionAsync(t => t.Id == user.TenantId)
                        .AsNoTracking()
                        .FirstOrDefaultAsync()
                    : null;

                var storedSsoConfig = SsoConfigHelpers.Parse(passwordlessUserTenant?.SSOConfigJson);

                if (passwordlessUserTenant != null && !passwordlessUserTenant.IsSSOEnabled && storedSsoConfig != null)
                {
                    serviceResponse.StatusCode = 409;
                    serviceResponse.Message = SsoConfigHelpers.SsoDisabledMessage;
                    return serviceResponse;
                }

                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // Try to Sign In
            var result = await _signInManager.CheckPasswordSignInAsync(user, pwdLoginDto.Pwd, true);

            // Account is locked
            if (result.IsLockedOut)
            {
                serviceResponse.Message = "Your account is locked. Please unlock it first";
                return serviceResponse;
            }

            // Signing in failed
            if (!result.Succeeded)
            {
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            /*403 Forbidden throwing error so avoiding it for now*/
            // Now error HTTP status code becomes 400
            serviceResponse.StatusCode = 400;

            // Get user again (Includes Tenant and Roles)
            user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => w.Id == user.Id)
                    .AsSplitQuery()
                    .Include(i => i.Tenant)
                    .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                    .AsNoTracking()
                    .SingleOrDefaultAsync();


            // Account is disabled
            if (user.IsDisabled)
            {
                serviceResponse.Message = "Your account is disabled. Please contact support adminstrator";
                return serviceResponse;
            }

            // Account is disabled
            if (user.DeactivatedOn.ToUniversalTime() < DateTime.MaxValue.ToUniversalTime() && user.DeactivatedOn.ToUniversalTime() != DateTime.MinValue.ToUniversalTime() && user.DeactivatedOn.ToUniversalTime() != DateTime.MaxValue.ToUniversalTime())
            {
                serviceResponse.Message = "Your account is deleted. Please contact support adminstrator";
                return serviceResponse;
            }

            // Check if the user is linked to a valid tenant
            if (user.TenantId != null)
            {
                // Tenant is null/disabled/expired
                if (!_authHelperService.IsUserTenantValid(user.Tenant, user.UserName))
                {
                    serviceResponse.Message = "Unable to retrieve your tenant's details. Please contact your support administrator.";
                    return serviceResponse;
                }

                // Password has expired
                if (user?.Tenant.IsPwdNeverExpiresEnabled == false && (DateTimeOffset.UtcNow - user.PwdSetOn)?.Days > user?.Tenant.DaysBeforePwdExpires)
                {
                    serviceResponse.StatusCode = 200;

                    /********IMPORTANCT NOTE********
                    DO NOT CHANGE the message's part "Your password has
                    been expired" as it has to match on frontend side
                    ********IMPORTANCT NOTE********/

                    serviceResponse.Message = "Your password has been expired. Please reset it to use your account";
                    return serviceResponse;
                }

                // TwoFA enabled
                if (user.Tenant.IsTwoFAEnabled || user.TwoFactorEnabled)
                {
                    // log information

                    /********IMPORTANCT NOTE********
                    DO NOT CHANGE the message's part "TwoFA is enabled" 
                    as it has to match in Controller and frontend side
                    ********IMPORTANCT NOTE********/

                    serviceResponse.StatusCode = 200;
                    serviceResponse.Message = "TwoFA is enabled";
                    return serviceResponse;
                }
            }
            // User is authenticated
            serviceResponse.Data = user;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User is authenticated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to authenticate user.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Checks the Two-Factor Authentication (2FA) verification code for the provided username.
    public async Task<ServiceResponse<AccountUser>> CheckTwoFAVerificationCodeAsync(CheckVerificationCodeDto checkVerificationCodeDto)
    {
        /*We can send failed response with 400 code (BadRequest), however we are not 
        going to inform the client about specific error (till code is verified) 
        due to security concerns*/

        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<AccountUser>()
        {
            Data = null,
            StatusCode = 401,
            Message = "Failed to verify code. Please try again"
        };

        try
        {
            // Get user's deviceId
            var userAgent = _httpContext.Request.Headers["User-Agent"].ToString();

            // Get VerificationCode 
            var verificationCode = await _unitOfWork.VerificationCodeRepo
                    .GetByConditionAsync(w =>
                        w.Id == checkVerificationCodeDto.VerificationCodeId &&
                        w.Email == checkVerificationCodeDto.Email &&
                        // TODO: Uncomment to check for DeviceId mismatch when needed
                        // w.DeviceId == userAgent &&
                        w.RequestType == checkVerificationCodeDto.RequestType
                    )
                    .SingleOrDefaultAsync();

            // VerificationCode not found
            if (verificationCode == null)
            {
                return serviceResponse;
            }

            // Code did not match
            if (verificationCode.SecretCode != checkVerificationCodeDto.SecretCode)
            {
                return serviceResponse;
            }

            // Code has expired
            if (verificationCode.ExpiresOn <= DateTimeOffset.UtcNow)
            {
                return serviceResponse;
            }

            // Delete verificationCode
            _unitOfWork.VerificationCodeRepo.Delete(verificationCode);

            // Delete-verificationCode job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Get user (Includes Tenant and Roles)
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => EF.Functions.ILike(checkVerificationCodeDto.Email, w.UserName))
                    .AsSplitQuery()
                    .Include(i => i.Tenant)
                    .Include(i => i.UserRoles)
                        .ThenInclude(i1 => i1.Role)
                            .ThenInclude(i2 => i2.RolePermissions)
                                .ThenInclude(i3 => i3.Permission)
                    .AsNoTracking()
                    .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // User is authenticated

            // Task successful
            serviceResponse.Data = user;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "TwoFA code has been validated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify 2FA code.");
            return serviceResponse;
        }

        return serviceResponse;
    }
}
