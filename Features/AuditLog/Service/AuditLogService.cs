namespace AccountsAPIs.Services;

public class AuditLogService(ILogger<AuthService> logger,
  IUnitOfWork unitOfWork, UserManager<AccountUser> userManager, SignInManager<AccountUser> signInManager,
  IHttpContextAccessor httpContextAccessor, IdentityConfig identityConfig,
  JwtConfig jwtConfig) : IAuditLogService
{
    private readonly ILogger<AuthService> _logger = logger;
    private readonly UserManager<AccountUser> _userManager = userManager;
    private readonly SignInManager<AccountUser> _signInManager = signInManager;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly Guid _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    private readonly string _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
    private readonly IdentityConfig _identityConfig = identityConfig;
    private readonly JwtConfig _jwtConfig = jwtConfig;

    // Insert new audit log
    public async Task<ServiceResponse<AuditLogDto>> InsertLogAsync(AuditLogDto auditLogDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AuditLogDto>
        {
            Data = null,
            Message = "Failed to insert audit log . Please try again"
        };
        try
        {
            // Trim dto' string props
            auditLogDto = TrimDtoStringPropsUtil.TrimDtoStringProps(auditLogDto);

            // Try to get user
            var user = await _unitOfWork.AccountUserRepo
                    .GetByConditionAsync(w => w.Id == _userId)
                    .SingleOrDefaultAsync();

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation($"User not found for User Id {_userId}");
                serviceResponse.Message = "User does not exist";
            }

            // Default mapping
            var newAuditLog = auditLogDto.Adapt<AuditLog>();

            // Insert plan
            await _unitOfWork.AuditLogRepo.InsertAsync(newAuditLog);

            // Insert-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting plan");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newAuditLog.Adapt<AuditLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Audit Log created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

            return serviceResponse;
        }
        return serviceResponse;
    }

    // Delete audit log
    public async Task<ServiceResponse<bool>> DeleteLogAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete log. Please try again"
        };
        try
        {
            // try to get audit log by id
            var auditLog = await _unitOfWork.AuditLogRepo
            .GetByConditionAsync(w => w.Id == id).FirstOrDefaultAsync();

            // log does not exist
            if (auditLog == null)
            {
                _logger.LogInformation($"Audit log does not exist");
                serviceResponse.Message = "Log not exist";
                return serviceResponse;
            }
            // Delete audit log
            _unitOfWork.AuditLogRepo.Delete(auditLog);

            // Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting audit log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Audit log deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

            serviceResponse.Message = "An error occurs while deteting audit log";
            return serviceResponse;
        }
        return serviceResponse;
    }


}