namespace AccountsAPIs.Services;

public class VerificationCodeService : IVerificationCodeService
{
    private readonly HttpContext _httpContext;
    private readonly JwtConfig _jwtConfig;
    private readonly ILogger<VerificationCodeService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;

    public VerificationCodeService(
        IHttpContextAccessor httpContextAccessor,
        ILogger<VerificationCodeService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        JwtConfig jwtConfig)
    {
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _jwtConfig = jwtConfig;
        _authHelperService = authHelperService;
    }

    // Checks the verification code for the provided username and request type.
    public async Task<ServiceResponse<bool>> CheckVerificationCodeAsync(CheckVerificationCodeDto checkVerificationCodeDto)
    {
        /*We can send failed response with 400 code (BadRequest), however we are not 
        going to inform the client about specific error due to security concerns*/

        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
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
                _logger.LogInformation($"Verification code not found. " +
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
                _logger.LogInformation($"Verification code did not match. " +
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
                _logger.LogInformation($"Verification code has expired. " +
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
                    $"While deleting verification code for " +
                    $"Verification code Id - {checkVerificationCodeDto.VerificationCodeId}, " +
                    $"requestType - {checkVerificationCodeDto.RequestType}, " +
                    $"username - {checkVerificationCodeDto.Email} and " +
                    $"device Id - {userAgent}");
                return serviceResponse;
            }

            // If RequestType is "ResetPwd"
            if (checkVerificationCodeDto.RequestType == VerificationCodeRequestTypesEnum.ResetPwd)
            {
                // Get user (Includes Tenant and Roles)
                var user = await _unitOfWork.AccountUserRepo
                        .GetByConditionAsync(w => w.UserName == checkVerificationCodeDto.Email)
                        .AsNoTracking()
                        .SingleOrDefaultAsync();
                
                // Get Jwt validity config
                var jwtExpiresOn = DateTimeOffset.UtcNow.AddMinutes(
                    _jwtConfig.PwdResetJwtValidityInMinutes);

                // Create Jwt string
                var jwt = _authHelperService.CreateJwt(user, jwtExpiresOn, true);

                // Append Jwt cookie and remove other (if any)
                _authHelperService.SetCookie(CookieNamesEnum.AccessToken.ToString(), jwt, jwtExpiresOn);
                _authHelperService.RemoveCookie(CookieNamesEnum.SessionId.ToString());
                _authHelperService.RemoveCookie(CookieNamesEnum.RefreshToken.ToString());
                _authHelperService.RemoveCookie(CookieNamesEnum.UserName.ToString());
            }

            // Task successful
            _logger.LogInformation($"Verification code has been validated successfully for " +
                    $"Verification code Id - {checkVerificationCodeDto.VerificationCodeId}, " +
                    $"requestType - {checkVerificationCodeDto.RequestType}, " +
                    $"username - {checkVerificationCodeDto.Email} and " +
                    $"device Id - {userAgent}");
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Verification code has been validated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}