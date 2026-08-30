namespace AccountsAPIs.Services;

public class VerificationCodeService : IVerificationCodeService
{
    private readonly HttpContext _httpContext;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ILogger<VerificationCodeService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthHelperService _authHelperService;

    public VerificationCodeService(
        IHttpContextAccessor httpContextAccessor,
        ILogger<VerificationCodeService> logger,
        IUnitOfWork unitOfWork,
        IAuthHelperService authHelperService,
        EnvironmentConfig environmentConfig)
    {
        _httpContext = Guard.Against.Null(httpContextAccessor.HttpContext, "HttpContext cannot be null");
        _logger = logger;
        _unitOfWork = unitOfWork;
        _environmentConfig = environmentConfig;
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

            // If RequestType is "ResetPwd"
            if (checkVerificationCodeDto.RequestType == VerificationCodeRequestTypesEnum.ResetPwd)
            {
                // Get user (Includes Tenant and Roles)
                var user = await _unitOfWork.AccountUserRepo
                        .GetByConditionAsync(w => EF.Functions.ILike(checkVerificationCodeDto.Email, w.UserName))
                        .AsNoTracking()
                        .SingleOrDefaultAsync();

                // Retrieve the tenant's subscription along with the associated plan details.
                var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                    .GetByConditionAsync(subscription => subscription.Id == user.Tenant.Id)
                    .Include(subscription => subscription.Plan)
                    .FirstOrDefaultAsync();

                // Extract the current plan type from the subscription, if available.
                string? currentPlan = tenantSubscription?.Plan?.Type.ToString();

                // Get Jwt validity config
                var jwtExpiresOn = DateTimeOffset.UtcNow.AddMinutes(10); // 10 minutes validity for reset pwd

                // Create Jwt string
                var jwt = _authHelperService.CreateJwt(user, jwtExpiresOn, true, null, currentPlan);

                // Append Jwt cookie and remove other (if any)
                _authHelperService.SetCookie(CookieNamesEnum.AccessToken.ToString(), jwt, jwtExpiresOn);
                _authHelperService.RemoveCookie(CookieNamesEnum.SessionId.ToString());
                _authHelperService.RemoveCookie(CookieNamesEnum.RefreshToken.ToString());
                _authHelperService.RemoveCookie(CookieNamesEnum.UserName.ToString());
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Verification code has been validated successfully";
        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }
}