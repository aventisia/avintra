namespace AccountsAPIs.Services;

public class LoginWithPwdService : ILoginWithPwdService
{
    private readonly SignInManager<AccountUser> _signInManager;
    private readonly UserManager<AccountUser> _userManager;
    private readonly ILogger<LoginWithPwdService> _logger;
    private readonly HttpContext _httpContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;

    public LoginWithPwdService(
        SignInManager<AccountUser> signInManager,
        IHttpContextAccessor httpContextAccessor,
        ILogger<LoginWithPwdService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        UserManager<AccountUser> userManager)
    {
        _signInManager = signInManager;
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _authHelperService = authHelperService;
        _userManager = userManager;
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
            /*Get user (Includes Tenant and Roles) getting error: "The instance of entity 
            type 'User' cannot be tracked because another instance with the 
            same key value for {'Id'} is already being tracked. So, getting user using userManager*/

            // Get user
            var user = await _userManager.FindByEmailAsync(pwdLoginDto.Email);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogWarning($"Account not found for email {pwdLoginDto.Email}");
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // Try to Sign In
            var result = await _signInManager.CheckPasswordSignInAsync(user, pwdLoginDto.Pwd, true);

            // Account is locked
            if (result.IsLockedOut)
            {
                _logger.LogWarning($"{pwdLoginDto.Email} account is locked");
                serviceResponse.Message = "Your account is locked. Please unlock it first";
                return serviceResponse;
            }

            // Signing in failed
            if (!result.Succeeded)
            {
                _logger.LogError($"Error while signing in user {pwdLoginDto.Email} with password. Error: {result}");
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            /*403 Forbidden throwing error so avoiding it for now*/
            // Now error HTTP status code becomes 400
            serviceResponse.StatusCode = 400;

            // Check if OSInfo is provided in the login DTO
            if (pwdLoginDto?.OSInfo != null && pwdLoginDto.OSInfo.ClientType == ClientTypesEnum.AssistAppMachine)
            {
                // Log the start of the machine validation check
                _logger.LogInformation("Starting machine validation with OS information.");

                // Construct the OSInformationDto object from the provided login DTO
                var osInformation = new OSInformationDto
                {
                    OSId = pwdLoginDto.OSInfo.OSId,
                    ClientType = pwdLoginDto.OSInfo.ClientType,   // TODO: Implement ClientType usage in future
                    HostName = string.Empty    // TODO: Implement HostName usage in future
                };

                try
                {
                    // Call the external API for machine validation
                    HttpResponseMessage httpResponse = await RequestExternalAPIUtil.RequestExternalAPI(
                        CrudTypesEnum.Create,
                        "http://localhost:4001/api/machine/validate",
                        null,
                        osInformation
                    );

                    // Check if the response is successful
                    if (!httpResponse.IsSuccessStatusCode)
                    {
                        _logger.LogWarning("Machine validation failed with status code: {StatusCode}", httpResponse.StatusCode);
                        serviceResponse.Message = "Machine validation failed with external service.";
                        return serviceResponse;
                    }

                    // Read and parse the response content
                    var responseContent = await httpResponse.Content.ReadAsStringAsync();
                    if (string.IsNullOrEmpty(responseContent))
                    {
                        _logger.LogError("Machine validation response content is empty.");
                        serviceResponse.Message = "Invalid response content from machine validation service.";
                        return serviceResponse;
                    }

                    // Deserialize response content into a service response object
                    var externalServiceResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<ServiceResponse<bool>>(responseContent);

                    // Validate the structure of the external service response
                    if (externalServiceResponse == null)
                    {
                        _logger.LogError("Error deserializing response content: {ResponseContent}", responseContent);
                        serviceResponse.Message = "Error deserializing machine validation response.";
                        return serviceResponse;
                    }

                    // Validate the response from the external service
                    if (externalServiceResponse.StatusCode != 200 || !externalServiceResponse.Data)
                    {
                        // Log the error details
                        _logger.LogError("Machine validation failed. Status: {StatusCode}, Success: {SuccessFlag}, Message: {Message}",
                                          externalServiceResponse.StatusCode, externalServiceResponse.Data, externalServiceResponse.Message);

                        // Set failure message
                        serviceResponse.Message = externalServiceResponse.Message;
                        return serviceResponse;
                    }

                    _logger.LogInformation("Machine validation passed.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error during machine validation.");
                    return serviceResponse;
                }
            }

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
                _logger.LogInformation($"{pwdLoginDto.Email} account is disabled");
                serviceResponse.Message = "Your account is disabled. Please contact support adminstrator";
                return serviceResponse;
            }

            // Account is disabled
            if (user.DeactivatedOn.ToUniversalTime() < DateTime.MaxValue.ToUniversalTime() && user.DeactivatedOn.ToUniversalTime() != DateTime.MinValue.ToUniversalTime() && user.DeactivatedOn.ToUniversalTime() != DateTime.MaxValue.ToUniversalTime())
            {
                _logger.LogInformation($"{pwdLoginDto.Email} account is deleted");
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
                    _logger.LogInformation($"{pwdLoginDto.Email} account's password has been expired");
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
                    _logger.LogInformation($"Returning TwoFA is enabled for account {pwdLoginDto.Email}");

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
            _logger.LogError(ex.ToString());
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
                    .GetByConditionAsync(w => w.Id == checkVerificationCodeDto.VerificationCodeId &&
                        w.Email == checkVerificationCodeDto.Email &&
                        w.RequestType == checkVerificationCodeDto.RequestType &&
                        w.DeviceId == userAgent)
                    .SingleOrDefaultAsync();

            // VerificationCode not found
            if (verificationCode == null)
            {
                _logger.LogInformation($"TwoFA Verification code not found. " +
                    $"While trying to validate verification code for " +
                    $"Verification code Id - {checkVerificationCodeDto.VerificationCodeId}, " +
                    $"requestType - {checkVerificationCodeDto.RequestType}, " +
                    $"username - {checkVerificationCodeDto.Email} and " +
                    $"device Id - {userAgent}");
                return serviceResponse;
            }

            // Code did not match
            if (verificationCode.SecretCode != checkVerificationCodeDto.SecretCode)
            {
                _logger.LogInformation($"TwoFA Verification code did not match. " +
                    $"While trying to validate verification code for " +
                    $"Verification code Id - {checkVerificationCodeDto.VerificationCodeId}, " +
                    $"requestType - {checkVerificationCodeDto.RequestType}, " +
                    $"username - {checkVerificationCodeDto.Email} and " +
                    $"device Id - {userAgent}");
                return serviceResponse;
            }

            // Code has expired
            if (verificationCode.ExpiresOn <= DateTimeOffset.UtcNow)
            {
                _logger.LogInformation($"TwoFA Verification code has expired. " +
                    $"While trying to validate verification code for " +
                    $"Verification code Id - {checkVerificationCodeDto.VerificationCodeId}, " +
                    $"requestType - {checkVerificationCodeDto.RequestType}, " +
                    $"username - {checkVerificationCodeDto.Email} and " +
                    $"device Id - {userAgent}");
                return serviceResponse;
            }

            // Delete verificationCode
            _unitOfWork.VerificationCodeRepo.Delete(verificationCode);

            // Delete-verificationCode job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Context SaveChanges failed. " +
                    $"While deleting TwoFA verification code for " +
                    $"Verification code Id - {checkVerificationCodeDto.VerificationCodeId}, " +
                    $"requestType - {checkVerificationCodeDto.RequestType}, " +
                    $"username - {checkVerificationCodeDto.Email} and " +
                    $"device Id - {userAgent}");
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
                _logger.LogInformation($"Account not found for email {checkVerificationCodeDto.Email}");
                serviceResponse.Message = "Invalid credentials";
                return serviceResponse;
            }

            // User is authenticated
            _logger.LogInformation($"TwoFA Verification code has been validated successfully for " +
                    $"Verification code Id - {checkVerificationCodeDto.VerificationCodeId}, " +
                    $"requestType - {checkVerificationCodeDto.RequestType}, " +
                    $"username - {checkVerificationCodeDto.Email} and " +
                    $"device Id - {userAgent}");

            // Task successful
            serviceResponse.Data = user;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "TwoFA code has been validated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}