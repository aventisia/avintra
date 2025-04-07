namespace AccountsAPIs.Services;

public class PlanTableService : IPlanTableService
{
    private readonly ILogger<PlanTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public PlanTableService(
        ILogger<PlanTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId from the HTTP context, defaulting to an empty GUID if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all plans created by the user
    public async Task<ServiceResponse<IEnumerable<PlanTableDto>>> GetPlansAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<PlanTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve plans. Please try again."
        };

        try
        {
            // Fetch plans from the repository and order by creation date
            var plans = await _unitOfWork.PlanRepo
                                          .GetAllAsync()
                                          .OrderByDescending(w => w.CreatedOn)
                                          .Include(a => a.Tenant)
                                          .ProjectToType<PlanTableDto>()
                                          .ToListAsync();

            // Set success response
            serviceResponse.Data = plans;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plans retrieved successfully.";
            _logger.LogInformation("Successfully retrieved {Count} plans.", plans.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving plans.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a plan by its ID
    public async Task<ServiceResponse<PlanTableDto>> GetPlanByIdAsync(Guid planId)
    {
        var serviceResponse = new ServiceResponse<PlanTableDto>
        {
            Data = null,
            Message = "Failed to delete plan. Please try again.",
        };

        try
        {
            // Fetch the plan by ID
            var plan = await _unitOfWork
                .PlanRepo.GetByConditionAsync(w => w.Id == planId)
                .Include(a => a.Tenant)
                .FirstOrDefaultAsync();

            // Check if the plan was found
            if (plan == null)
            {
                _logger.LogInformation("No plan found with ID: {PlanId}", planId);
                return serviceResponse;
            }

            // If found, set the response data and message
            serviceResponse.Data = plan.Adapt<PlanTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan retrieved successfully.";
            _logger.LogInformation("Plan retrieved successfully with ID: {PlanId}", planId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the plan with ID: {PlanId}", planId);
            serviceResponse.StatusCode = 500;
        }

        return serviceResponse;
    }

    // Retrieves a list of plan options.
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetPlanOptionListAsync()
    {
        // Initialize the service response with a default null data and an error message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve plans. Please try again."
        };

        try
        {
            // Retrieve all plans from the repository
            var plans = await _unitOfWork.PlanRepo.GetAllAsync().ToListAsync();

            // Map the retrieved plan list to SelectOptionDto and update the response
            serviceResponse.Data = plans.Adapt<IEnumerable<SelectOptionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plans retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the error and return the service response with the default message
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Inserts a new plan
    public async Task<ServiceResponse<PlanTableDto>> InsertPlanAsync(PlanTableDto planTableDto)
    {
        var serviceResponse = new ServiceResponse<PlanTableDto>
        {
            Data = null,
            Message = "Failed to insert plan. Please try again."
        };

        try
        {
            // Check if the plan already exists
            var planAlreadyExists = await _unitOfWork.PlanRepo
                .GetByConditionAsync(w =>
                    w.PricingComponent == planTableDto.PricingComponent &&
                    (w.TenantType == null || w.TenantType == planTableDto.TenantType) &&
                    (w.TenantId == null || w.TenantId == Guid.Empty || w.TenantId == planTableDto.TenantId) &&
                    w.Currency == planTableDto.Currency &&
                    w.Frequency == planTableDto.Frequency
                )
                .FirstOrDefaultAsync();

            if (planAlreadyExists != null)
            {
                _logger.LogInformation("The plan '{PricingComponent}' already exists.", planTableDto.PricingComponent);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A plan with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO
            planTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(planTableDto);
            var newPlan = planTableDto.Adapt<PlanPricing>();
            newPlan.Unit = newPlan.PricingComponent == PricingComponentsEnum.GPUCompute ? UnitTypesEnum.License : UnitTypesEnum.Credit;
            newPlan.CreatedByUserId = _userId;
            newPlan.LastModifiedByUserId = _userId;

            // Insert the new plan
            await _unitOfWork.PlanRepo.InsertAsync(newPlan);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new plan.");
                return serviceResponse;
            }

            serviceResponse.Data = newPlan.Adapt<PlanTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan created successfully.";
            _logger.LogInformation("The plan '{PricingComponent}' was created successfully.", planTableDto.PricingComponent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting plan.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing plan
    public async Task<ServiceResponse<PlanTableDto>> UpdatePlanAsync(PlanTableDto planTableDto)
    {
        var serviceResponse = new ServiceResponse<PlanTableDto>
        {
            Data = null,
            Message = "Failed to update plan. Please try again."
        };

        try
        {
            // Fetch the plan to update
            var plan = await _unitOfWork.PlanRepo
                                         .GetByConditionAsync(w =>
                                             w.Id == planTableDto.Id)
                                         .SingleOrDefaultAsync();

            // Check if the plan exists
            if (plan == null)
            {
                _logger.LogInformation("The plan with ID '{PlanId}' does not exist.", planTableDto.Id);
                serviceResponse.Message = "Plan does not exist.";
                return serviceResponse;
            }

            // Check if another plan with the same name exists
            var planAlreadyExists = await _unitOfWork.PlanRepo
                                                     .GetByConditionAsync(w =>
                                                        w.Id != planTableDto.Id &&
                                                        w.PricingComponent == planTableDto.PricingComponent &&
                                                        (w.TenantType == null || w.TenantType == planTableDto.TenantType) &&
                                                        (w.TenantId == null || w.TenantId == planTableDto.TenantId) &&
                                                        w.Currency == planTableDto.Currency &&
                                                        w.Frequency == planTableDto.Frequency)
                                                     .FirstOrDefaultAsync();

            if (planAlreadyExists != null)
            {
                _logger.LogInformation("The plan name '{PricingComponent}' is already in use by another plan.", planTableDto.PricingComponent);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A plan with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO
            planTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(planTableDto);
            planTableDto.Adapt(plan);
            plan.LastModifiedByUserId = _userId;
            plan.Unit = plan.PricingComponent == PricingComponentsEnum.GPUCompute ? UnitTypesEnum.License : UnitTypesEnum.Credit;
            // Update the plan
            _unitOfWork.PlanRepo.Update(plan);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating plan.");
                return serviceResponse;
            }

            serviceResponse.Data = plan.Adapt<PlanTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan updated successfully.";
            _logger.LogInformation("The plan '{PricingComponent}' was updated successfully.", planTableDto.PricingComponent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating plan.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a plan by its ID
    public async Task<ServiceResponse<bool>> DeletePlanAsync(Guid planId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete plan. Please try again."
        };

        try
        {
            // Fetch the plan to delete
            var plan = await _unitOfWork.PlanRepo
                                         .GetByConditionAsync(w =>
                                             w.Id == planId)
                                         .SingleOrDefaultAsync();

            // Check if the plan exists
            if (plan == null)
            {
                _logger.LogInformation("The plan with ID '{PlanId}' does not exist.", planId);
                serviceResponse.Message = "Plan does not exist.";
                return serviceResponse;
            }

            // Delete the plan
            _unitOfWork.PlanRepo.Delete(plan);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting plan.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan deleted successfully.";
            _logger.LogInformation("The plan with ID '{PlanId}' was deleted successfully.", planId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting plan.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple plans by their IDs
    public async Task<ServiceResponse<bool>> DeletePlansAsync(List<Guid> planIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete plans. Please try again."
        };

        try
        {
            // Fetch the plans to delete
            var plans = await _unitOfWork.PlanRepo
                                          .GetByConditionAsync(w =>
                                              planIds.Contains(w.Id))
                                          .ToListAsync();

            // Check if any plans were found
            if (plans.Count == 0)
            {
                _logger.LogInformation("No plans found to delete.");
                serviceResponse.Message = "No plans were found for deletion.";
                return serviceResponse;
            }

            // Delete the plans
            _unitOfWork.PlanRepo.Delete(plans);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting plans.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{planIds.Count} plans deleted successfully.";
            _logger.LogInformation("{Count} plans were deleted successfully.", planIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple plans.");
            return serviceResponse;
        }

        return serviceResponse;
    }
}
