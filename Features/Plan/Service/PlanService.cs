namespace AccountsAPIs.Services;

public class PlanService : IPlanService
{
    private readonly ILogger<AuthService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly string _userName;
    private readonly IdentityConfig _identityConfig;
    private readonly JwtConfig _jwtConfig;
    private readonly string _jwt;
    private readonly Guid _sessionId;

    public PlanService(ILogger<AuthService> logger,
      IUnitOfWork unitOfWork,
      IHttpContextAccessor httpContextAccessor, IdentityConfig identityConfig,
      JwtConfig jwtConfig)
    {
        //Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
        _logger = logger;
        _unitOfWork = unitOfWork;
        _identityConfig = identityConfig;
        _jwtConfig = jwtConfig;
    }

    // Retrive plan list
    public async Task<ServiceResponse<IEnumerable<PlanDto>>> GetPlanAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<PlanDto>>
        {
            Data = null,
            Message = "Failed to retrive plan . Please try again"
        };
        try
        {
            var plan = await _unitOfWork.planRepo.GetAllAsync()
            .ToListAsync();

            // Plan does not exist
            if (plan == null)
            {
                _logger.LogInformation($"Plan does not exist");
                serviceResponse.Message = "Plan not exist";
                return serviceResponse;
            }
            // Task successful
            serviceResponse.Data = plan.Adapt<IEnumerable<PlanDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "plan retrived successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while retrive plan list";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Retrive plan list by status
    public async Task<ServiceResponse<IEnumerable<PlanDto>>> GetPlanStatusAsync(string status)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<PlanDto>>
        {
            Data = null,
            Message = "Failed to retrive plan status.Please try again"
        };
        try
        {
            // Fetch plans based on status 
            var plans = await _unitOfWork.planRepo.
            GetByConditionAsync(w => w.Status == status)
            .ToListAsync();

            // Plan does not exist
            if (plans == null)
            {
                _logger.LogInformation($"Plan does not exist");
                serviceResponse.Message = "Plan not exist";
                return serviceResponse;
            }
            // Task successful
            serviceResponse.Data = plans.Adapt<IEnumerable<PlanDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "plan status list retrived successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while retrive plan status list";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Insert a new plan
    public async Task<ServiceResponse<PlanDto>> InsertPlanAsync(PlanDto planDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PlanDto>
        {
            Data = null,
            Message = "Failed to insert plan. Please try again"
        };
        try
        {
            // Trim dto' string props
            planDto = TrimDtoStringPropsUtil.TrimDtoStringProps(planDto);

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

            // Default mapping
            var newPlan = planDto.Adapt<Plan>();
            newPlan.CreatedByUserId = _userId;
            newPlan.LastModifiedByUserId = _userId;

            // Insert plan
            await _unitOfWork.planRepo.InsertAsync(newPlan);

            // Insert-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting plan");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newPlan.Adapt<PlanDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
        
    }
    // Update plan
    public async Task<ServiceResponse<PlanDto>> UpdatePlanAsync(PlanDto planDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PlanDto>
        {
            Data = null,
            Message = "Failed to update plan. Please try again"
        };
        try
        {
            // validate existing plan
            var planUpdate = await _unitOfWork.planRepo
            .GetByConditionAsync(w => w.Id == planDto.Id)
            .FirstOrDefaultAsync();

            // if plan does not exist
            if (planUpdate == null)
            {
                _logger.LogInformation($"plan does not exist");
                serviceResponse.Message = "plan not exist";
                return serviceResponse;
            }
             // Default mapping 
            var newPlan = planDto.Adapt(planUpdate);

            // Update plan
            _unitOfWork.planRepo.Update(newPlan);
            newPlan.CreatedByUserId = _userId;
            newPlan.LastModifiedByUserId = _userId;

            //  Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while silently updating plan ");
                return serviceResponse;
            }

            //Task successful
            serviceResponse.Data = newPlan.Adapt<PlanDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while updating plan";
            return serviceResponse;
        }
        return serviceResponse;
        
    }
   

    public async Task<ServiceResponse<PlanFeaturesDto>> UpdatePlanFeatureAsync(PlanFeaturesDto PlanFeatureDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PlanFeaturesDto>
        {
            Data = null,
            Message = "Failed to update plan features. Please try again"
        };
        try
        {
            // Validate the plan exists
            var planToUpdate = await _unitOfWork.planRepo
                .GetByConditionAsync(w => w.Id == PlanFeatureDto.Id)
                .FirstOrDefaultAsync();

            // Plan does not exist
            if (planToUpdate == null)
            {
                _logger.LogInformation($"Plan with ID {PlanFeatureDto.Id} does not exist");
                serviceResponse.Message = "Plan does not exist";
                return serviceResponse;
            }

            // Trim string properties to avoid unnecessary whitespace
            PlanFeatureDto = TrimDtoStringPropsUtil.TrimDtoStringProps(PlanFeatureDto);

            planToUpdate.Features = PlanFeatureDto.Features;
            planToUpdate.LastModifiedByUserId = _userId;

            // Save changes to the database
            _unitOfWork.planRepo.Update(planToUpdate);

            // Ensure changes are committed to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Failed to save changes when updating plan with ID {PlanFeatureDto.Id}");
                serviceResponse.Message = "Failed to save changes";
                return serviceResponse;
            }

            //Task successful
            serviceResponse.Data = planToUpdate.Adapt<PlanFeaturesDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while updating plan";
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Delete plan 
    public async Task<ServiceResponse<bool>> DeletePlanAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete plan. Please try again"
        };
        try
        {
            var plan = await _unitOfWork.planRepo
            .GetByConditionAsync(w => w.Id == id)
            .FirstOrDefaultAsync();

            // Plan does not exist
            if (plan == null)
            {
                _logger.LogInformation($"Plan does not exist");
                serviceResponse.Message = "Plan not exist";
                return serviceResponse;
            }
            // Delte plan
            _unitOfWork.planRepo.Delete(plan);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting plan");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while deteting plan";
            return serviceResponse;
        }
        return serviceResponse;

    }

}