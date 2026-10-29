namespace AccountsAPIs.Services;

public class SubscriptionPlanService : ISubscriptionPlanService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SubscriptionPlanService> _logger;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public SubscriptionPlanService(IUnitOfWork unitOfWork, ILogger<SubscriptionPlanService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Extract user ID from the JWT token in the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

    }

    // Retrieves all subscription plans from the database including the creator user.
    public async Task<ServiceResponse<IEnumerable<SubscriptionPlanDto>>> GetAllSubscriptionPlansAsync(SubscriptionPlanTypeEnum subscriptionPlanType, SubscriptionFrequenciesEnum frequency, CurrencyTypesEnum currency)
    {
        // Initialize a default failure response
        var serviceResponse = new ServiceResponse<IEnumerable<SubscriptionPlanDto>>
        {
            Data = null,
            Message = "Failed to retrieve subscription plans. Please try again."
        };

        try
        {
            // Retrieve tenant details based on tenant ID
            var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstOrDefaultAsync();

            // Check if the tenant's country is India and set the currency accordingly
            if (tenant.Country == CountriesEnum.India)
            {
                // Set currency to INR for tenants in India
                currency = CurrencyTypesEnum.INR;
            }

            // Start building the database query; nothing is executed yet.
            IQueryable<SubscriptionPlan> query = _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w =>
                    (
                        w.Status == PlanStatusTypesEnum.Current
                    ) ||
                    w.Type == SubscriptionPlanTypeEnum.Starter
                )
                .Include(plan => plan.CreatedByUser);

            // Check if a filter for subscription plan type (Pro or Starter) was provided.
            if (subscriptionPlanType == SubscriptionPlanTypeEnum.Pro || subscriptionPlanType == SubscriptionPlanTypeEnum.Starter)
            {
                // If yes, filter for plans of type Pro or Starter, and match frequency and currency
                query = query.Where(w =>
                    (
                        w.Type == SubscriptionPlanTypeEnum.Starter || w.Type == SubscriptionPlanTypeEnum.Pro) &&
                        w.Frequency == frequency &&
                        w.Currency == currency
                    );
            }
            else
            {
                // For any other subscription plan type, filter based on the exact type, frequency, and currency
                query = query.Where(w =>
                    w.Type == subscriptionPlanType &&
                    w.Frequency == frequency &&
                    w.Currency == currency
                );
            }

            // Execute the final query against the database and get the results.
            var subscriptionPlans = await query
                .OrderByDescending(plan => plan.CreatedOn)
                .ToListAsync();

            // Map the plans to DTOs for safe transfer
            serviceResponse.Data = subscriptionPlans.Adapt<IEnumerable<SubscriptionPlanDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plans retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving subscription plans.");
        }

        return serviceResponse;
    }

    // Retrieves all subscription plans from the database
    public async Task<ServiceResponse<IEnumerable<SubscriptionPlanDto>>> GetListSubscriptionPlansAsync()
    {
        // Initialize a default failure response
        var serviceResponse = new ServiceResponse<IEnumerable<SubscriptionPlanDto>>
        {
            Data = null,
            Message = "Failed to retrieve subscription plans. Please try again."
        };

        try
        {
            // Start building the database query; nothing is executed yet.
            IQueryable<SubscriptionPlan> query = _unitOfWork.SubscriptionPlanRepo.GetAllAsync()
                .Include(plan => plan.CreatedByUser);

            // Execute the final query against the database and get the results.
            var subscriptionPlans = await query
                .OrderByDescending(plan => plan.CreatedOn)
                .ToListAsync();

            // Map the plans to DTOs for safe transfer
            serviceResponse.Data = subscriptionPlans.Adapt<IEnumerable<SubscriptionPlanDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plans retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving subscription plans.");
        }

        return serviceResponse;
    }

    // Retrieves all subscription plans as selectable options for UI components.
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableSubscriptionPlanOptionsAsync(SubscriptionPlanTypeEnum? subscriptionPlanType)
    {
        // Initialize response with default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            Message = "Failed to retrive subscription plan options. Please try again."
        };

        try
        {
            // Retrieve all subscription plans without including related entities (lightweight fetch)
            var subscriptionPlans = await _unitOfWork.SubscriptionPlanRepo
                .GetAllAsync()
                .ToListAsync();

            // If a subscription plan type filter is provided, apply it to the list
            if (subscriptionPlanType.HasValue) subscriptionPlans = subscriptionPlans.Where(w => w.Type == subscriptionPlanType).ToList();

            // Convert subscription plans to SelectOption for UI consumption
            serviceResponse.Data = subscriptionPlans.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plan options retrived successfully.";

            _logger.LogInformation("Retrived {Count} subscription plan option(s) for selection.", subscriptionPlans.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while retriving subscription plan options.");
        }

        return serviceResponse;
    }

    // Retrieves a single subscription plan by its unique ID.
    public async Task<ServiceResponse<SubscriptionPlanDto>> GetSubscriptionPlanByIdAsync(Guid subscriptionPlanId)
    {
        // Initialize a service response object with a failure message
        var serviceResponse = new ServiceResponse<SubscriptionPlanDto>
        {
            Data = null,
            Message = "failed to retrieve the subscription plan. Please try again."
        };

        try
        {

            // Query the database for the plan and include the creator
            var plan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Id == subscriptionPlanId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If plan not found, return warning
            if (plan == null)
            {
                _logger.LogWarning("No subscription plan found with ID: {SubscriptionPlanId}", subscriptionPlanId);
                serviceResponse.Message = "Subscription plan not found.";
                return serviceResponse;
            }

            // Map and return the found plan
            serviceResponse.Data = plan.Adapt<SubscriptionPlanDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plan retrieved successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving subscription plan with ID: {SubscriptionPlanId}", subscriptionPlanId);
        }

        return serviceResponse;
    }

    // Creates a new subscription plan if it doesn't already exist.
    public async Task<ServiceResponse<SubscriptionPlanDto>> CreateSubscriptionPlanAsync(SubscriptionPlanDto subscriptionPlanDto)
    {
        // Initialize a service response object with a failure message
        var serviceResponse = new ServiceResponse<SubscriptionPlanDto>
        {
            Data = null,
            Message = "Failed to create subscription plan. Please try again later."
        };

        try
        {

            // Check if plan name already exists (case-insensitive)
            var existingPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w =>
                    w.Status == PlanStatusTypesEnum.Current &&
                    w.Type == subscriptionPlanDto.Type &&
                    w.Frequency == subscriptionPlanDto.Frequency &&
                    w.Currency == subscriptionPlanDto.Currency
                )
                .SingleOrDefaultAsync();

            if (existingPlan != null)
            {
                _logger.LogWarning("A subscription plan named '{PlanName}' already exists.", subscriptionPlanDto.Name);
                serviceResponse.Message = $"A subscription plan with the name '{subscriptionPlanDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim any string fields to clean input
            subscriptionPlanDto = TrimDtoStringPropsUtil.TrimDtoStringProps(subscriptionPlanDto);

            // Map DTO to entity and assign creator/modifier IDs
            var newSubscriptionPlan = subscriptionPlanDto.Adapt<SubscriptionPlan>();
            newSubscriptionPlan.UniqueName = $"{newSubscriptionPlan.Type}-{newSubscriptionPlan.Frequency}-{newSubscriptionPlan.Currency}".ToLower();
            newSubscriptionPlan.CreatedByUserId = _userId;
            newSubscriptionPlan.LastModifiedByUserId = _userId;

            // Insert and save changes
            await _unitOfWork.SubscriptionPlanRepo.InsertAsync(newSubscriptionPlan);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist new subscription plan: {PlanName}", subscriptionPlanDto.Name);
                return serviceResponse;
            }

            // Return the newly created plan
            serviceResponse.Data = newSubscriptionPlan.Adapt<SubscriptionPlanDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plan created successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while creating subscription plan: {PlanName}", subscriptionPlanDto.Name);
        }

        return serviceResponse;
    }

    // Checks the availability of a subscription plan name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsSubscriptionPlanNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check subscription plan name availability. Please try again."
        };

        try
        {
            // Trim and normalize the plan name input
            var subscriptionPlanName = checkAvailabilityDto.UserInput?.Trim();

            if (string.IsNullOrWhiteSpace(subscriptionPlanName))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Subscription plan name cannot be empty. Please provide a valid name.";
                return serviceResponse;
            }

            // Check if subscription plan with the same name exists (case-insensitive)
            var existingPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Name.ToLower() == subscriptionPlanName.ToLower())
                .SingleOrDefaultAsync();

            // Subscription plan name already exists
            if (existingPlan != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = $"A subscription plan with the name '{subscriptionPlanName}' already exists. Please try a different name.";
                return serviceResponse;
            }

            // Name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"The subscription plan name '{subscriptionPlanName}' is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while checking subscription plan name availability.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing subscription plan with new values.
    public async Task<ServiceResponse<SubscriptionPlanDto>> UpdateSubscriptionPlanAsync(SubscriptionPlanDto subscriptionPlanDto)
    {
        // Initialize a service response object with a failure message
        var serviceResponse = new ServiceResponse<SubscriptionPlanDto>
        {
            Data = null,
            Message = "Failed to update subscription plan. Please try again."
        };

        try
        {
            _logger.LogInformation("Updating subscription plan with ID: {SubscriptionPlanId}", subscriptionPlanDto.Id);

            // Check if the plan to update exists
            var existingPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Id == subscriptionPlanDto.Id)
                .SingleOrDefaultAsync();

            if (existingPlan == null)
            {
                _logger.LogWarning("Subscription plan not found with ID: {SubscriptionPlanId}", subscriptionPlanDto.Id);
                serviceResponse.Message = "Subscription plan not found.";
                return serviceResponse;
            }

            // Check for duplicate name (excluding itself)
            var duplicatePlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w =>
                    w.Id != subscriptionPlanDto.Id &&
                    w.Name.ToLower() == subscriptionPlanDto.Name.ToLower() &&
                    w.Currency == subscriptionPlanDto.Currency &&
                    w.Frequency == subscriptionPlanDto.Frequency &&
                    w.Type == subscriptionPlanDto.Type &&
                    w.Status == subscriptionPlanDto.Status
                )
                .SingleOrDefaultAsync();

            if (duplicatePlan != null)
            {
                _logger.LogWarning("Duplicate plan name detected: {PlanName}", subscriptionPlanDto.Name);
                serviceResponse.Message = $"A subscription plan with the name '{subscriptionPlanDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim all string properties in the DTO to remove leading/trailing whitespace
            subscriptionPlanDto = TrimDtoStringPropsUtil.TrimDtoStringProps(subscriptionPlanDto);

            // Update the disabled status only if explicitly specified (nullable bool)
            if (subscriptionPlanDto.IsDisabled != null)
                existingPlan.IsDisabled = subscriptionPlanDto.IsDisabled.Value;

            // Update usage limits and feature settings
            existingPlan.Name = subscriptionPlanDto.Name;
            existingPlan.Price = subscriptionPlanDto.Price;
            existingPlan.Status = subscriptionPlanDto.Status;
            existingPlan.MaxCredits = subscriptionPlanDto.MaxCredits;
            existingPlan.MaxPublishedItems = subscriptionPlanDto.MaxPublishedItems;
            existingPlan.MaxSpaces = subscriptionPlanDto.MaxSpaces;
            existingPlan.MaxUsers = subscriptionPlanDto.MaxUsers;
            existingPlan.StorageLimitMB = subscriptionPlanDto.StorageLimitMB;
            existingPlan.HistoryRetentionDays = subscriptionPlanDto.HistoryRetentionDays;

            // Set the user who last modified the plan (audit tracking)
            existingPlan.LastModifiedByUserId = _userId;

            // Apply update and save
            _unitOfWork.SubscriptionPlanRepo.Update(existingPlan);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes for subscription plan: {SubscriptionPlanId}", subscriptionPlanDto.Id);
                return serviceResponse;
            }

            // Return updated plan
            serviceResponse.Data = existingPlan.Adapt<SubscriptionPlanDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plan updated successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating subscription plan with ID: {SubscriptionPlanId}", subscriptionPlanDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a specific subscription plan by ID.
    public async Task<ServiceResponse<bool>> DeleteSubscriptionPlanAsync(Guid subscriptionPlanId)
    {
        // Initialize a service response object with a failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete subscription plan. Please try again later."
        };

        try
        {
            _logger.LogInformation("Deleting subscription plan with ID: {SubscriptionPlanId}", subscriptionPlanId);

            // Fetch plan to ensure it exists
            var plan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Id == subscriptionPlanId)
                .Include(w => w.TenantSubscriptions)
                .SingleOrDefaultAsync();

            // Check if the plan does not exist
            if (plan == null)
            {
                _logger.LogWarning("No subscription plan found with ID: {SubscriptionPlanId}", subscriptionPlanId);
                serviceResponse.Message = "Subscription plan not found.";
                return serviceResponse;
            }

            // Check if the plan has any active tenant subscriptions
            if (plan.TenantSubscriptions.Count != 0)
            {
                _logger.LogWarning("Subscription plan with ID: {SubscriptionPlanId} cannot be deleted because it has active tenant subscriptions.", subscriptionPlanId);
                serviceResponse.Message = "Cannot delete subscription plan because it has active tenant subscriptions.";
                return serviceResponse;
            }

            // Delete and save
            _unitOfWork.SubscriptionPlanRepo.Delete(plan);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete subscription plan with ID: {SubscriptionPlanId}", subscriptionPlanId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plan deleted successfully.";

            _logger.LogInformation("Subscription plan with ID: {SubscriptionPlanId} deleted.", subscriptionPlanId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while deleting subscription plan with ID: {SubscriptionPlanId}", subscriptionPlanId);
        }

        return serviceResponse;
    }

    // Deletes multiple subscription plans by a list of IDs.
    public async Task<ServiceResponse<bool>> DeleteSubscriptionPlansAsync(List<Guid> subscriptionPlanIds)
    {
        // Initialize a service response object with a failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete subscription plans. Please try again later."
        };

        try
        {

            // Fetch all matching plans
            var plans = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => subscriptionPlanIds.Contains(w.Id))
                .Include(i => i.TenantSubscriptions)
                .ToListAsync();

            if (plans == null || plans.Count == 0)
            {
                _logger.LogWarning("No matching subscription plans found to delete.");
                serviceResponse.Message = "No matching subscription plans found.";
                return serviceResponse;
            }

            foreach (var plan in plans)
            {
                // Check if the plan has any active tenant subscriptions
                if (plan.TenantSubscriptions.Count != 0)
                {
                    _logger.LogWarning("Subscription plan with ID: {SubscriptionPlanId} cannot be deleted because it has active tenant subscriptions.", plan.Id);
                    serviceResponse.Message = "Cannot delete subscription plan because it has active tenant subscriptions.";
                    return serviceResponse;
                }
            }

            // Perform bulk delete and save
            _unitOfWork.SubscriptionPlanRepo.Delete(plans);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete subscription plans in bulk.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plans deleted successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while bulk deleting subscription plans.");
        }

        return serviceResponse;
    }
}