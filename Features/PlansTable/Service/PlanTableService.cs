namespace AccountsAPIs.Services;

public class PlanTableService : IPlanTableService
{
    private readonly ILogger<PlanTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public PlanTableService(
        ILogger<PlanTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId from the HTTP context, defaulting to an empty GUID if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all plans created by the user
    public async Task<ServiceResponse<IEnumerable<PlanTableDto>>> GetAllPricingPlansAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<PlanTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve plans. Please try again."
        };

        try
        {
            // Fetch plans from the repository and order by creation date
            var plans = await _unitOfWork.PricingPlanRepo
                                          .GetByConditionAsync(w => w.TenantId == _tenantId)
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
    public async Task<ServiceResponse<PlanTableDto>> GetPricingPlanByIdAsync(Guid pricingPlanId)
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
                .PricingPlanRepo.GetByConditionAsync(w => w.Id == pricingPlanId)
                .Include(a => a.Tenant)
                .FirstOrDefaultAsync();

            // Check if the plan was found
            if (plan == null)
            {
                _logger.LogInformation("No plan found with ID: {PricingPlanId}", pricingPlanId);
                return serviceResponse;
            }

            // If found, set the response data and message
            serviceResponse.Data = plan.Adapt<PlanTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan retrieved successfully.";
            _logger.LogInformation("Plan retrieved successfully with ID: {PricingPlanId}", pricingPlanId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the plan with ID: {PricingPlanId}", pricingPlanId);
        }

        return serviceResponse;
    }

    // Inserts a new plan
    public async Task<ServiceResponse<PlanTableDto>> CreatePricingPlanAsync(PlanTableDto planTableDto)
    {
        var serviceResponse = new ServiceResponse<PlanTableDto>
        {
            Data = null,
            Message = "Failed to insert plan. Please try again."
        };

        try
        {
            // Check if the plan already exists
            var planAlreadyExists = await _unitOfWork.PricingPlanRepo
            .GetByConditionAsync(w =>
                    w.PricingComponent == planTableDto.PricingComponent &&
                    (planTableDto.TenantType == null || w.TenantType == planTableDto.TenantType) &&
                     w.TenantId == _tenantId &&
                    w.Currency == planTableDto.Currency &&
                    w.Frequency == planTableDto.Frequency)
                .FirstOrDefaultAsync();

            if (planAlreadyExists != null)
            {
                _logger.LogInformation("The plan '{PricingComponent}' already exists.", planTableDto.PricingComponent);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A plan with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the Data Transfer Object (DTO)
            planTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(planTableDto);

            // Map the trimmed DTO to the PlanPricing model
            var newPlan = planTableDto.Adapt<PlanPricing>();

            // Set the unit based on the pricing component type
            newPlan.Unit = newPlan.PricingComponent == PricingComponentsEnum.GPUCompute ? UnitTypesEnum.Credit : UnitTypesEnum.License;

            // Set frequency to null if the pricing component is GPU Compute
            newPlan.Frequency = newPlan.PricingComponent != PricingComponentsEnum.GPUCompute ? newPlan.Frequency : FrequencyTypesEnum.NA;

            // Assign the user ID for the creator  and last modifier of the plan
            newPlan.CreatedByUserId = newPlan.LastModifiedByUserId = _userId;

            // Insert the new plan
            await _unitOfWork.PricingPlanRepo.InsertAsync(newPlan);

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
    public async Task<ServiceResponse<PlanTableDto>> UpdatePricingPlanAsync(PlanTableDto planTableDto)
    {
        var serviceResponse = new ServiceResponse<PlanTableDto>
        {
            Data = null,
            Message = "Failed to update plan. Please try again."
        };

        try
        {
            // Fetch the plan to update
            var plan = await _unitOfWork.PricingPlanRepo
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
            var planAlreadyExists = await _unitOfWork.PricingPlanRepo
                                                     .GetByConditionAsync(w =>
                                                        w.Id != planTableDto.Id &&
                                                        w.PricingComponent == planTableDto.PricingComponent &&
                                                        (w.TenantType == null || w.TenantType == planTableDto.TenantType) &&
                                                        (w.TenantId == null || w.TenantId == _tenantId) &&
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

            // Trim string properties in the Data Transfer Object (DTO)
            planTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(planTableDto);

            // Map the trimmed DTO to the existing plan object
            planTableDto.Adapt(plan);

            // Set the unit based on the pricing component type
            plan.Unit = plan.PricingComponent == PricingComponentsEnum.GPUCompute ? UnitTypesEnum.Credit : UnitTypesEnum.License;

            // Set frequency to null if the pricing component is GPU Compute
            plan.Frequency = plan.PricingComponent != PricingComponentsEnum.GPUCompute ? plan.Frequency : null;

            // Assign the user ID of the last modifier
            plan.LastModifiedByUserId = _userId;

            // Update the plan in the repository
            _unitOfWork.PricingPlanRepo.Update(plan);


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
    public async Task<ServiceResponse<bool>> DeletePricingPlanAsync(Guid planId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete plan. Please try again."
        };

        try
        {
            // Fetch the plan to delete
            var plan = await _unitOfWork.PricingPlanRepo
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
            _unitOfWork.PricingPlanRepo.Delete(plan);

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
    public async Task<ServiceResponse<bool>> DeletePricingPlansAsync(List<Guid> planIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete plans. Please try again."
        };

        try
        {
            // Fetch the plans to delete
            var plans = await _unitOfWork.PricingPlanRepo
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
            _unitOfWork.PricingPlanRepo.Delete(plans);

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
    // Retrieves a list of plan options.
    public Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetPricingPlansOptionListAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve pricing plans. Please try again."
        };

        try
        {
            // Retrieve pricing plans based on the enum values
            var pricingPlans = Enum.GetValues(typeof(PricingComponentsEnum))
                                   .Cast<PricingComponentsEnum>()
                                   .SelectMany(p => GetPricingPlansForComponent(p))
                                   .ToList();

            // Set success response with retrieved plans
            serviceResponse.Data = pricingPlans;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Pricing plans retrieved successfully.";
            _logger.LogInformation("Successfully retrieved {Count} plans.", pricingPlans.Count);
        }
        catch (Exception ex)
        {
            // Log the exception and return failure response
            _logger.LogError(ex, "An error occurred while retrieving plans.");
        }

        return Task.FromResult(serviceResponse); ;
    }

    // Helper method to generate pricing plans for a given pricing component
    private IEnumerable<SelectOptionDto> GetPricingPlansForComponent(PricingComponentsEnum pricingComponent)
    {
        // Return different options based on the pricing component
        switch (pricingComponent)
        {
            case PricingComponentsEnum.AIAgent:
                return new List<SelectOptionDto>
                {
                    new SelectOptionDto
                    {
                        Label = $"{pricingComponent} (Monthly)",
                        Value = $"{pricingComponent}-Monthly",
                        Description = "Monthly pricing component for AIAgent",
                        Disabled = false,
                        Fixed = false
                    },
                    new SelectOptionDto
                    {
                        Label = $"{pricingComponent} (Annually)",
                        Value = $"{pricingComponent}-Annually",
                        Description = "Annually pricing component for AIAgent",
                        Disabled = false,
                        Fixed = false
                    }
                };

            case PricingComponentsEnum.AutomationAgent:
                return new List<SelectOptionDto>
                {
                    new SelectOptionDto
                    {
                        Label = $"{pricingComponent} (Monthly)",
                        Value = $"{pricingComponent}-Monthly",
                        Description = "Monthly pricing component for AutomationAgent",
                        Disabled = false,
                        Fixed = false
                    },
                    new SelectOptionDto
                    {
                        Label = $"{pricingComponent} (Annually)",
                        Value = $"{pricingComponent}-Annually",
                        Description = "Annually pricing component for AutomationAgent",
                        Disabled = false,
                        Fixed = false
                    }
                };

            case PricingComponentsEnum.GPUCompute:
                return new List<SelectOptionDto>
                {
                    new SelectOptionDto
                    {
                        Label = $"{pricingComponent}",
                        Value = $"{pricingComponent}",
                        Description = "Pricing component for GPUCompute",
                        Disabled = false,
                        Fixed = false
                    }
                };

            default:
                // Return an empty list if the component is unrecognized
                return new List<SelectOptionDto>();
        }
    }

    public async Task<ServiceResponse<PricingPlanTableDto>> GetPricingPlanByComponentAsync(string pricingComponent)
    {
        // Initialize the service response with a default failure message
        var response = new ServiceResponse<PricingPlanTableDto>
        {
            Data = null,
            Message = "Failed to retrieve pricing plans. Please try again.",
        };

        try
        {
            // Parse the pricingComponent string (e.g., "AIAgent-Monthly" or "GPUCompute")
            var splitResult = pricingComponent.Split('-');

            // Validate the split result format: must be 1 or 2 parts
            if (splitResult.Length < 1 || splitResult.Length > 2)
            {
                _logger.LogError("Invalid pricing component format. Expected format: 'PricingComponent' or 'PricingComponent-Frequency'.");
                response.Message = "Invalid pricing component format.";
                return response;
            }

            // Try parsing the first part into PricingComponentsEnum
            if (!Enum.TryParse(splitResult[0], out PricingComponentsEnum pricingPlanName))
            {
                _logger.LogError("Invalid pricing component name.");
                response.Message = "Invalid pricing component name.";
                return response;
            }

            // Parse frequency if applicable
            FrequencyTypesEnum? frequency = null;

            // If the component is not GPUCompute, parse the frequency from the second part
            if (pricingPlanName != PricingComponentsEnum.GPUCompute && splitResult.Length == 2)
            {
                if (!Enum.TryParse(splitResult[1], out FrequencyTypesEnum parsedFrequency))
                {
                    _logger.LogError("Invalid frequency value. Must be 'Monthly' or 'Annually'.");
                    response.Message = "Invalid frequency value. Must be 'Monthly' or 'Annually'.";
                    return response;
                }
                frequency = parsedFrequency;
            }

            // Retrieve the current tenant and the default "IndividualUsers" tenant
            var tenants = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t =>
                     t.Id == _tenantId ||
                    t.Name.Equals(GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers))
                )
                .ToListAsync();

            // If no tenants were found, exit early
            if (!tenants.Any())
            {
                _logger.LogError("No tenants found.");
                response.Message = "No tenants found.";
                return response;
            }
            // Get all plans for this tenant or the default tenant
            var tenantIds = tenants.Select(t => t.Id);
            var allPlans = await _unitOfWork.PricingPlanRepo
                .GetByConditionAsync(w => w.TenantId == null || tenantIds.Contains(w.TenantId!.Value))
                .ToListAsync();

            // Initialize the result plan variable
            PlanPricing? resultPlan = null;

            // Try to find a matching plan for the current tenant
            if (_tenantId != Guid.Empty)
            {
                // Get the current tenant from the list based on the _tenantId
                var currentTenant = tenants.FirstOrDefault(t => t.Id == _tenantId);

                resultPlan = allPlans.FirstOrDefault(f =>
                    f.TenantId == _tenantId &&
                    f.Currency == currentTenant.Currency &&
                    f.TenantType == currentTenant.Type &&
                    f.PricingComponent == pricingPlanName &&
                    (pricingPlanName == PricingComponentsEnum.GPUCompute || f.Frequency == frequency)
                );
            }

            // If no tenant-specific plan was found, fall back to the default tenant
            if (resultPlan == null)
            {
                var defaultTenant = tenants.FirstOrDefault(f =>
                    f.Name.Equals(GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers)));

                resultPlan = allPlans.FirstOrDefault(f =>
                    f.TenantId == null &&
                    f.Currency == defaultTenant.Currency &&
                    f.TenantType == defaultTenant.Type &&
                    f.PricingComponent == pricingPlanName &&
                    (pricingPlanName == PricingComponentsEnum.GPUCompute || f.Frequency == frequency)
                );
            }

            // If no plan was found after both checks, return an appropriate message
            if (resultPlan == null)
            {
                response.Message = "No matching pricing plans found.";
                return response;
            }

            // Map the result to the DTO and return a success response
            response.Data = resultPlan.Adapt<PricingPlanTableDto>();
            response.StatusCode = 200;
            response.Message = "Pricing plan retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log unexpected errors
            _logger.LogError(ex, "Error retrieving pricing plan options.");
        }

        // Return the final response (either data or error message)
        return response;
    }
}
