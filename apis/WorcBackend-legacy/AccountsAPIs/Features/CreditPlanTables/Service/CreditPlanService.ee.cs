namespace AccountsAPIs.Services;

public class CreditPlanService : ICreditPlanService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreditPlanService> _logger;
    private readonly Guid _userId;

    public CreditPlanService(IUnitOfWork unitOfWork, ILogger<CreditPlanService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Extract user ID from JWT token in the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves all credit plans including the user who created each plan
    public async Task<ServiceResponse<IEnumerable<CreditPlanDto>>> GetAllCreditPlansAsync()
    {
        // Initialize a service response with failure message and null data by default
        var serviceResponse = new ServiceResponse<IEnumerable<CreditPlanDto>>
        {
            Data = null,
            Message = "Failed to retrieve credit plans. Please try again."
        };

        try
        {
            // Fetch all credit plans and include the related CreatedByUser entity (navigation property)
            var creditPlans = await _unitOfWork.CreditPlanRepo
                .GetAllAsync()
                .Include(i => i.CreatedByUser)
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Map entities to DTOs for returning to client
            serviceResponse.Data = creditPlans.Adapt<IEnumerable<CreditPlanDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit plans retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving credit plans.");
        }

        // Return the service response object
        return serviceResponse;
    }

    // Retrieves credit plans formatted as select options for UI dropdowns or selection controls
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableCreditPlanOptionsAsync()
    {
        // Initialize service response with failure defaults
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            Message = "Failed to retrieve credit plan options. Please try again."
        };

        try
        {
            // Fetch all credit plans without including navigation properties (simpler data)
            var creditPlans = await _unitOfWork.CreditPlanRepo
                .GetAllAsync()
                .ToListAsync();

            // Map to SelectOption for UI consumption
            serviceResponse.Data = creditPlans.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit plan options retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while retrieving credit plan options.");
        }

        return serviceResponse;
    }

    // Retrieves a single credit plan by its unique identifier
    public async Task<ServiceResponse<CreditPlanDto>> GetCreditPlanByIdAsync(Guid creditPlanId)
    {
        // Initialize response with failure defaults
        var serviceResponse = new ServiceResponse<CreditPlanDto>
        {
            Data = null,
            Message = "Failed to retrieve the credit plan. Please try again."
        };

        try
        {

            // Query the repository for the credit plan including the creator user info
            var creditPlan = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => w.Id == creditPlanId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If no creditPlan found, log warning and update message
            if (creditPlan == null)
            {
                _logger.LogWarning("No credit plan found with ID: {CreditPlanId}", creditPlanId);
                serviceResponse.Message = "Credit plan not found.";
                return serviceResponse;
            }

            // Map the entity to DTO and update response
            serviceResponse.Data = creditPlan.Adapt<CreditPlanDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit plan retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving credit plan with ID: {CreditPlanId}", creditPlanId);
        }

        return serviceResponse;
    }

    // Creates a new credit plan if one doesn't already exist with the same name
    public async Task<ServiceResponse<CreditPlanDto>> CreateCreditPlanAsync(CreditPlanDto creditPlanDto)
    {
        // Default response for failure
        var serviceResponse = new ServiceResponse<CreditPlanDto>
        {
            Data = null,
            Message = "Failed to create credit plan. Please try again later."
        };

        try
        {
            // Check if a plan with the same name already exists
            var existingPlan = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => w.ServiceType == creditPlanDto.ServiceType)
                .SingleOrDefaultAsync();

            if (existingPlan != null)
            {
                _logger.LogWarning("Service type '{ServiceType}' already exists.", creditPlanDto.ServiceType.ToString());
                serviceResponse.Message = $"A credit plan with the service type '{creditPlanDto.ServiceType.ToString()}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up input data before saving
            creditPlanDto = TrimDtoStringPropsUtil.TrimDtoStringProps(creditPlanDto);

            // Map DTO to entity
            var newCreditPlan = creditPlanDto.Adapt<CreditPlan>();

            // Set the creator's ID
            newCreditPlan.CreatedByUserId = _userId;
            newCreditPlan.LastModifiedByUserId = _userId;

            // Insert the new plan into the database
            await _unitOfWork.CreditPlanRepo.InsertAsync(newCreditPlan);

            // Save changes and check if successful
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save new credit plan with service type: {ServiceType}", creditPlanDto.ServiceType.ToString());
                return serviceResponse;
            }

            // Return the new plan data in the response
            serviceResponse.Data = newCreditPlan.Adapt<CreditPlanDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit plan created successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating credit plan with service type: {ServiceType}", creditPlanDto.ServiceType.ToString());
        }

        return serviceResponse;
    }

    // Checks if a credit plan name is available (not already taken)
    public async Task<ServiceResponse<TrueFalseResultDto>> IsCreditPlanNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Default response if check fails
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check service type availability. Please try again."
        };

        try
        {
            // Trim user input
            var creditPlanName = checkAvailabilityDto.UserInput?.Trim();

            // Return false if the name is empty
            if (string.IsNullOrWhiteSpace(creditPlanName))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.Message = "Please provide a valid service type.";
                return serviceResponse;
            }

            // Check if a plan with the same name exists
            var existingPlan = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => w.ServiceType == Enum.Parse<CreditServicesEnum>(creditPlanName))
                .FirstOrDefaultAsync();

            if (existingPlan != null)
            {
                // Return false if the name is already taken
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.Message = $"Service type '{creditPlanName}' already exists. Try a different name.";
                return serviceResponse;
            }

            // Return true if the name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Service type '{creditPlanName}' is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking plan name availability.");
        }

        return serviceResponse;
    }

    // Updates an existing credit plan with new information
    public async Task<ServiceResponse<CreditPlanDto>> UpdateCreditPlanAsync(CreditPlanDto creditPlanDto)
    {
        // Default failure response
        var serviceResponse = new ServiceResponse<CreditPlanDto>
        {
            Data = null,
            Message = "Failed to update credit plan. Please try again."
        };

        try
        {

            // Fetch the existing plan by ID
            var existingPlan = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => w.Id == creditPlanDto.Id)
                .SingleOrDefaultAsync();

            if (existingPlan == null)
            {
                _logger.LogWarning("Credit plan not found with ID: {CreditPlanId}", creditPlanDto.Id);
                serviceResponse.Message = "Credit plan not found.";
                return serviceResponse;
            }

            // Check if another plan with the same name exists (excluding current plan)
            var duplicatePlan = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => w.ServiceType == creditPlanDto.ServiceType && w.Id != creditPlanDto.Id)
                .SingleOrDefaultAsync();

            if (duplicatePlan != null)
            {
                _logger.LogWarning("Duplicate service tyope: {ServiceType}", creditPlanDto.ServiceType.ToString());
                serviceResponse.Message = $"Service type '{creditPlanDto.ServiceType.ToString()}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up string properties in the DTO
            creditPlanDto = TrimDtoStringPropsUtil.TrimDtoStringProps(creditPlanDto);

            // Map DTO data to the existing plan
            creditPlanDto.Adapt(existingPlan);
            existingPlan.LastModifiedByUserId = _userId;

            // Update the plan in the database
            _unitOfWork.CreditPlanRepo.Update(existingPlan);

            // Save changes and check if successful
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes for plan ID: {CreditPlanId}", creditPlanDto.Id);
                return serviceResponse;
            }

            // Return updated plan in the response
            serviceResponse.Data = existingPlan.Adapt<CreditPlanDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit plan updated successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating credit plan with ID: {CreditPlanId}", creditPlanDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a single credit plan by its ID
    public async Task<ServiceResponse<bool>> DeleteCreditPlanAsync(Guid creditPlanId)
    {
        // Initialize response with failure default and data = false
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete credit plan. Please try again later."
        };

        try
        {

            // Find the credit plan entity by ID
            var creditPlan = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => w.Id == creditPlanId)
                .SingleOrDefaultAsync();

            if (creditPlan == null)
            {
                _logger.LogWarning("No credit plan found with ID: {CreditPlanId}", creditPlanId);
                serviceResponse.Message = "Credit plan not found.";
                return serviceResponse;
            }

            // Delete the found entity
            _unitOfWork.CreditPlanRepo.Delete(creditPlan);

            // Save changes and check for success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete credit plan with ID: {CreditPlanId}", creditPlanId);
                return serviceResponse;
            }

            // Set data true and success status/message on successful deletion
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit plan deleted successfully.";

            _logger.LogInformation("Credit plan with ID: {CreditPlanId} deleted.", creditPlanId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while deleting credit plan with ID: {CreditPlanId}", creditPlanId);
        }

        return serviceResponse;
    }

    // Deletes multiple credit plans by a list of IDs in bulk
    public async Task<ServiceResponse<bool>> DeleteCreditPlansAsync(List<Guid> creditPlanIds)
    {
        // Initialize response with failure defaults and data = false
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete credit plans. Please try again later."
        };

        try
        {

            // Fetch all plans matching the provided list of IDs
            var creditPlans = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => creditPlanIds.Contains(w.Id))
                .ToListAsync();

            // Check if any matching plans found
            if (creditPlans == null || creditPlans.Count == 0)
            {
                _logger.LogWarning("No matching credit plans found to delete.");
                serviceResponse.Message = "No matching credit plans found.";
                return serviceResponse;
            }

            // Delete all found plans in bulk
            _unitOfWork.CreditPlanRepo.Delete(creditPlans);

            // Save changes and check for success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete credit plans in bulk.");
                return serviceResponse;
            }

            // Set success response data and message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit plans deleted successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while bulk deleting credit plans.");
        }

        return serviceResponse;
    }
}