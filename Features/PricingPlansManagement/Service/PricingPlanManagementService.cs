namespace AccountsAPIs.Services;

public class PricingPlanManagementService : IPricingPlanManagementService
{
    private readonly ILogger<PricingPlanManagementService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public PricingPlanManagementService(
        ILogger<PricingPlanManagementService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId from the HTTP context, defaulting to an empty GUID if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all pricing plans, optionally filtered by tenant and ordered by creation date.
    public async Task<ServiceResponse<IEnumerable<PricingPlanTableDto>>> GetAllPricingPlansAsync(Guid? tenantId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<PricingPlanTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve plans. Please try again."
        };

        try
        {
            // Fetch all pricing plans from the repository and order them by creation date in descending order.
            var pricingPlans = await _unitOfWork.PricingPlanRepo
                                              .GetAllAsync()
                                              .OrderByDescending(w => w.CreatedOn)
                                              .Include(a => a.Tenant)
                                              .ProjectToType<PricingPlanTableDto>()
                                              .ToListAsync();

            // If tenantId is provided, filter the plans by TenantId.
            if (tenantId.HasValue)
            {
                pricingPlans = pricingPlans.Where(w => w.TenantId == tenantId.Value).ToList();
            }

            // Set the success response with the retrieved plans
            serviceResponse.Data = pricingPlans;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plans retrieved successfully.";
            _logger.LogInformation("Successfully retrieved {Count} plans.", pricingPlans.Count);
        }
        catch (Exception ex)
        {
            // Log the exception and return the failure response
            _logger.LogError(ex, "An error occurred while retrieving plans.");
            return serviceResponse;
        }

        return serviceResponse;  // Return the service response with retrieved data
    }

    // Retrieves a specific pricing plan by its unique identifier.
    public async Task<ServiceResponse<PricingPlanTableDto>> GetPricingPlanDetailsAsync(Guid pricingPlanId)
    {
        var serviceResponse = new ServiceResponse<PricingPlanTableDto>
        {
            Data = null,
            Message = "Failed to retrieve pricing plan. Please try again."
        };

        try
        {
            // Fetch the pricing plan by its ID, including the related Tenant data.
            var pricingPlan = await _unitOfWork
                .PricingPlanRepo.GetByConditionAsync(w => w.Id == pricingPlanId)
                .Include(a => a.Tenant)
                .FirstOrDefaultAsync();

            // Check if the plan was found in the database
            if (pricingPlan == null)
            {
                // Log that no plan was found with the specified ID
                _logger.LogInformation("No pricing plan found with ID: {PricingPlanId}", pricingPlanId);
                return serviceResponse;
            }

            // If the plan is found, map the entity to a DTO and set the response data
            serviceResponse.Data = pricingPlan.Adapt<PricingPlanTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Pricing plan retrieved successfully.";
            _logger.LogInformation("Pricing plan retrieved successfully with ID: {PricingPlanId}", pricingPlanId);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the retrieval process
            _logger.LogError(ex, "An error occurred while retrieving the plan with ID: {PricingPlanId}", pricingPlanId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<PricingPlanTableDto>> GetPricingPlanByComponentAsync(string pricingComponent, Guid? tenantId)
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
                    (tenantId.HasValue && t.Id == tenantId) ||
                    (!tenantId.HasValue && t.Name.Equals(GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers)))
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
            if (tenantId.HasValue)
            {
                // Get the current tenant from the list based on the tenantId
                var currentTenant = tenants.FirstOrDefault(t => t.Id == tenantId);

                resultPlan = allPlans.FirstOrDefault(f =>
                    f.TenantId == tenantId &&
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

    // Inserts a new pricing plan into the system
    public async Task<ServiceResponse<PricingPlanTableDto>> CreatePricingPlanAsync(PricingPlanTableDto pricingPlanTableDto)
    {
        // Initialize the response object with a default failure message
        var serviceResponse = new ServiceResponse<PricingPlanTableDto>
        {
            Data = null,
            Message = "Failed to insert pricing plan. Please try again."
        };

        try
        {
            // Check if a pricing plan with the same properties already exists in the database
            var planAlreadyExists = await _unitOfWork.PricingPlanRepo
                .GetByConditionAsync(w =>
                    w.PricingComponent == pricingPlanTableDto.PricingComponent &&
                    (pricingPlanTableDto.TenantType == null || w.TenantType == pricingPlanTableDto.TenantType) &&
                    (pricingPlanTableDto.TenantId == null || w.TenantId == pricingPlanTableDto.TenantId) &&
                    w.Currency == pricingPlanTableDto.Currency &&
                    w.Frequency == pricingPlanTableDto.Frequency)
                .FirstOrDefaultAsync();

            // If a plan already exists, return a conflict response
            if (planAlreadyExists != null)
            {
                _logger.LogInformation("The pricing plan '{PricingComponent}' already exists.", pricingPlanTableDto.PricingComponent);
                serviceResponse.StatusCode = 409; // Conflict status code
                serviceResponse.Message = "A pricing plan with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the Data Transfer Object (DTO) to remove any unnecessary white spaces
            pricingPlanTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(pricingPlanTableDto);

            // Map the trimmed DTO to the PlanPricing model for insertion
            var newPlan = pricingPlanTableDto.Adapt<PlanPricing>();

            // Set the unit based on the pricing component type (GPUCompute or License)
            newPlan.Unit = newPlan.PricingComponent == PricingComponentsEnum.GPUCompute ? UnitTypesEnum.Credit : UnitTypesEnum.License;

            // Set frequency to null if the pricing component is GPU Compute (since frequency is not relevant for GPUCompute)
            newPlan.Frequency = newPlan.PricingComponent != PricingComponentsEnum.GPUCompute ? newPlan.Frequency : FrequencyTypesEnum.NA;

            // Assign the user ID for the creator and the last modifier of the plan
            newPlan.CreatedByUserId = newPlan.LastModifiedByUserId = _userId;

            // Insert the new pricing plan into the repository
            await _unitOfWork.PricingPlanRepo.InsertAsync(newPlan);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new plan.");
                return serviceResponse;
            }

            // On success, set the response data and status code
            serviceResponse.Data = newPlan.Adapt<PricingPlanTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Pricing plan created successfully.";

            // Log the successful creation of the pricing plan
            _logger.LogInformation("The pricing plan '{PricingComponent}' was created successfully.", pricingPlanTableDto.PricingComponent);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the process
            _logger.LogError(ex, "An error occurred while inserting pricing plan.");
            return serviceResponse;
        }

        // Return the service response
        return serviceResponse;
    }

    // Updates an existing pricing plan in the system
    public async Task<ServiceResponse<PricingPlanTableDto>> UpdatePricingPlanAsync(PricingPlanTableDto pricingPlanTableDto)
    {
        // Initialize the response object with a default failure message
        var serviceResponse = new ServiceResponse<PricingPlanTableDto>
        {
            Data = null,
            Message = "Failed to update pricing plan. Please try again."
        };

        try
        {
            // Retrieve the existing pricing plan to be updated
            var planPricing = await _unitOfWork.PricingPlanRepo
                .GetByConditionAsync(w => w.Id == pricingPlanTableDto.Id)
                .SingleOrDefaultAsync();

            // Check if the plan exists
            if (planPricing == null)
            {
                _logger.LogInformation("The pricing plan with ID '{PricingPlanId}' does not exist.", pricingPlanTableDto.Id);
                serviceResponse.Message = "Pricing plan does not exist.";
                return serviceResponse;
            }

            // Check if another plan with the same name (and matching properties) already exists
            var planAlreadyExists = await _unitOfWork.PricingPlanRepo
                .GetByConditionAsync(w =>
                    w.Id != pricingPlanTableDto.Id &&
                    w.PricingComponent == pricingPlanTableDto.PricingComponent &&
                    (w.TenantType == null || w.TenantType == pricingPlanTableDto.TenantType) &&
                    (w.TenantId == null || w.TenantId == Guid.Empty || w.TenantId == pricingPlanTableDto.TenantId) &&
                    w.Currency == pricingPlanTableDto.Currency &&
                    w.Frequency == pricingPlanTableDto.Frequency)
                .FirstOrDefaultAsync();

            // If another plan with the same details exists, return a conflict response
            if (planAlreadyExists != null)
            {
                _logger.LogInformation("The pricing plan name '{PricingComponent}' is already in use by another plan.", pricingPlanTableDto.PricingComponent);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A pricing plan with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the Data Transfer Object (DTO) to ensure no unwanted whitespace
            pricingPlanTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(pricingPlanTableDto);

            // Map the trimmed DTO to the existing plan object for updating
            pricingPlanTableDto.Adapt(planPricing);

            // Set the unit based on the pricing component type
            planPricing.Unit = planPricing.PricingComponent == PricingComponentsEnum.GPUCompute ? UnitTypesEnum.Credit : UnitTypesEnum.License;

            // Set frequency to null if the pricing component is GPU Compute (as it's not applicable)
            planPricing.Frequency = planPricing.PricingComponent != PricingComponentsEnum.GPUCompute ? planPricing.Frequency : null;

            // Assign the user ID of the last modifier
            planPricing.LastModifiedByUserId = _userId;

            // Update the plan in the repository
            _unitOfWork.PricingPlanRepo.Update(planPricing);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating pricing plan.");
                return serviceResponse;
            }

            // If the update was successful, return the updated plan in the response
            serviceResponse.Data = planPricing.Adapt<PricingPlanTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Pricing plan updated successfully.";
            _logger.LogInformation("The pricing plan '{PricingComponent}' was updated successfully.", pricingPlanTableDto.PricingComponent);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the update process
            _logger.LogError(ex, "An error occurred while updating the pricing plan.");
        }

        // Return the service response
        return serviceResponse;
    }

    // Deletes a pricing plan by its ID
    public async Task<ServiceResponse<bool>> DeletePricingPlanByIdAsync(Guid pricingPlanId)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete pricing plan. Please try again."
        };

        try
        {
            // Fetch the pricing plan from the repository by its ID
            var pricingPlan = await _unitOfWork.PricingPlanRepo
                .GetByConditionAsync(w => w.Id == pricingPlanId)
                .SingleOrDefaultAsync();

            // Check if the pricing plan was found
            if (pricingPlan == null)
            {
                // Log the information that the plan was not found and return the appropriate message
                _logger.LogInformation("The pricing plan with ID '{PricingPlanId}' does not exist.", pricingPlanId);
                serviceResponse.Message = "Pricing plan does not exist.";
                return serviceResponse;
            }

            // Proceed to delete the found pricingPlan plan
            _unitOfWork.PricingPlanRepo.Delete(pricingPlan);

            // Attempt to save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                // Log an error if the changes could not be saved
                _logger.LogInformation("Failed to save changes while deleting plan.");
                return serviceResponse;
            }

            // If deletion was successful, set the response data to true and return a success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Plan deleted successfully.";
            _logger.LogInformation("The plan with ID '{PricingPlanId}' was deleted successfully.", pricingPlanId);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the deletion process
            _logger.LogError(ex, "An error occurred while deleting the plan with ID '{PricingPlanId}'.", pricingPlanId);
            return serviceResponse; // Return the failure response
        }

        // Return the service response
        return serviceResponse;
    }

    // Deletes multiple pricing plans by their IDs
    public async Task<ServiceResponse<bool>> DeleteMultiplePricingPlansAsync(List<Guid> pricingPlanIds)
    {
        // Initialize the response object with a default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete plans. Please try again."
        };

        try
        {
            // Fetch the pricing plans from the repository that match the provided IDs
            var pricingPlans = await _unitOfWork.PricingPlanRepo
                .GetByConditionAsync(w => pricingPlanIds.Contains(w.Id))
                .ToListAsync();

            // Check if any plans were found for deletion
            if (pricingPlans.Count == 0)
            {
                _logger.LogInformation("No pricing plans found to delete.");
                serviceResponse.Message = "No pricing plans were found for deletion.";
                return serviceResponse;
            }

            // Proceed to delete the found plans
            _unitOfWork.PricingPlanRepo.Delete(pricingPlans);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting pricing plans.");
                return serviceResponse;
            }

            // If deletion was successful, set the response data to true and return a success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{pricingPlanIds.Count} plans deleted successfully.";
            _logger.LogInformation("{Count} plans were deleted successfully.", pricingPlanIds.Count);
        }
        catch (Exception ex)
        {
            // Log the error and return the response indicating failure
            _logger.LogError(ex, "An error occurred while deleting multiple pricing plans.");
        }

        // Return the service response
        return serviceResponse;
    }

    public Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetPricingPlanSelectOptionsAsync()
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

}
