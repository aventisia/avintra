namespace AccountsAPIs.Services;

public class SubscriptionPlanService : ISubscriptionPlanService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPlanService _planService;
    private readonly ILogger<SubscriptionPlanService> _logger;
    private readonly Guid _userId;

    public SubscriptionPlanService(IUnitOfWork unitOfWork, ILogger<SubscriptionPlanService> logger, IHttpContextAccessor httpContextAccessor, IPlanService planService)
    {
        _unitOfWork = unitOfWork;
        _planService = planService;
        _logger = logger;

        // Extract user ID from the JWT token in the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves all subscription plans from the database including the creator user.
    public async Task<ServiceResponse<IEnumerable<SubscriptionPlanDto>>> GetAllSubscriptionPlansAsync(SubscriptionPlanTypeEnum? subscriptionPlanType)
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

            // Check if a filter was provided.
            if (subscriptionPlanType.HasValue)
            {
                // If yes, add a filter for that specific type to the database query.
                query = query.Where(plan => plan.Type == subscriptionPlanType.Value);
            }

            // Execute the final query against the database and get the results.
            var subscriptionPlans = await query
                .OrderByDescending(plan => plan.CreatedOn)
                .ToListAsync();

            // Map the plans to DTOs for safe transfer
            serviceResponse.Data = subscriptionPlans.Adapt<IEnumerable<SubscriptionPlanDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription plans retrieved successfully.";

            _logger.LogInformation("Retrieved {Count} subscription plan(s).", subscriptionPlans.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving subscription plans.");
        }

        return serviceResponse;
    }

    // Retrieves all subscription plans as selectable options for UI components.
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetSelectableSubscriptionPlanOptionsAsync(SubscriptionPlanTypeEnum? subscriptionPlanType)
    {
        // Initialize response with default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
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

            // Convert subscription plans to SelectOptionDto for UI consumption
            serviceResponse.Data = subscriptionPlans.Adapt<IEnumerable<SelectOptionDto>>();
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
        var serviceResponse = new ServiceResponse<SubscriptionPlanDto>
        {
            Data = null,
            Message = "failed to retrieve the subscription plan. Please try again."
        };

        try
        {
            _logger.LogInformation("Fetching subscription plan with ID: {SubscriptionPlanId}", subscriptionPlanId);

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

            _logger.LogInformation("Successfully retrieved subscription plan with ID: {SubscriptionPlanId}", subscriptionPlanId);
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
        var serviceResponse = new ServiceResponse<SubscriptionPlanDto>
        {
            Data = null,
            Message = "Failed to create subscription plan. Please try again later."
        };

        try
        {
            _logger.LogInformation("Attempting to create a new subscription plan: {PlanName}", subscriptionPlanDto.Name);

            // Check if plan name already exists (case-insensitive)
            var existingPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Name.ToLower() == subscriptionPlanDto.Name.ToLower())
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
            newSubscriptionPlan.UniqueName = $"{newSubscriptionPlan.Name}-{newSubscriptionPlan.Frequency}-{newSubscriptionPlan.Currency}".ToLower();
            newSubscriptionPlan.CreatedByUserId = _userId;
            newSubscriptionPlan.LastModifiedByUserId = _userId;

            // Check if the Razorpay Plan ID has not been set yet
            // and ensure the plan type is not 'Starter' (which may not require a Razorpay plan)
            if (string.IsNullOrEmpty(newSubscriptionPlan.RazorpayPlanId) && newSubscriptionPlan.Type != SubscriptionPlanTypeEnum.Starter)
            {
                // // Create a new Razorpay plan asynchronously for the subscription plan
                // string? razorpayPlanId = await CreateRazorpayPlanAsync(newSubscriptionPlan);

                // // Assign the newly created Razorpay plan ID to the existing subscription plan
                // existingPlan.RazorpayPlanId = razorpayPlanId;
            }

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

            _logger.LogInformation("Subscription plan created successfully with ID: {SubscriptionPlanId}", newSubscriptionPlan.Id);
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
        var serviceResponse = new ServiceResponse<SubscriptionPlanDto>
        {
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
                .GetByConditionAsync(w => w.Name.ToLower() == subscriptionPlanDto.Name.ToLower() && w.Id != subscriptionPlanDto.Id)
                .SingleOrDefaultAsync();

            if (duplicatePlan != null)
            {
                _logger.LogWarning("Duplicate plan name detected: {PlanName}", subscriptionPlanDto.Name);
                serviceResponse.Message = $"A subscription plan with the name '{subscriptionPlanDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim and update fields
            subscriptionPlanDto = TrimDtoStringPropsUtil.TrimDtoStringProps(subscriptionPlanDto);
            subscriptionPlanDto.Adapt(existingPlan);
            existingPlan.UniqueName = $"{existingPlan.Name}-{existingPlan.Frequency}-{existingPlan.Currency}".ToLower();
            existingPlan.LastModifiedByUserId = _userId;

            // Check if the Razorpay Plan ID has not been set yet
            // and ensure the plan type is not 'Starter' (which may not require a Razorpay plan)
            if (string.IsNullOrEmpty(existingPlan.RazorpayPlanId) && existingPlan.Type != SubscriptionPlanTypeEnum.Starter)
            {
                // // Create a new Razorpay plan asynchronously for the subscription plan
                // string? razorpayPlanId = await CreateRazorpayPlanAsync(existingPlan);

                // // Assign the newly created Razorpay plan ID to the existing subscription plan
                // existingPlan.RazorpayPlanId = razorpayPlanId;
            }

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

            _logger.LogInformation("Subscription plan with ID {SubscriptionPlanId} updated successfully.", subscriptionPlanDto.Id);
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
                .SingleOrDefaultAsync();

            if (plan == null)
            {
                _logger.LogWarning("No subscription plan found with ID: {SubscriptionPlanId}", subscriptionPlanId);
                serviceResponse.Message = "Subscription plan not found.";
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
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete subscription plans. Please try again later."
        };

        try
        {
            _logger.LogInformation("Bulk deletion of {Count} subscription plans initiated.", subscriptionPlanIds.Count);

            // Fetch all matching plans
            var plans = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => subscriptionPlanIds.Contains(w.Id))
                .ToListAsync();

            if (plans == null || plans.Count == 0)
            {
                _logger.LogWarning("No matching subscription plans found to delete.");
                serviceResponse.Message = "No matching subscription plans found.";
                return serviceResponse;
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

            _logger.LogInformation("Successfully deleted {Count} subscription plans.", plans.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while bulk deleting subscription plans.");
        }

        return serviceResponse;
    }

    // Creates a new Razorpay plan based on the provided subscription plan details.
    public async Task<string?> CreateRazorpayPlanAsync(SubscriptionPlan subscriptionPlan)
    {
        // Prepare the request DTO with the required Razorpay plan details
        var razorpayPlan = await _planService.CreatePlanAsync(new PlanRequestDto()
        {
            // Billing frequency (e.g., monthly/yearly) - converted to lowercase as expected by Razorpay
            Period = subscriptionPlan.Frequency.ToString().ToLower(),

            // Interval is set to 1 (e.g., every 1 month or 1 year)
            Interval = 1,

            // Define the item details including name, currency, and amount
            Item = new PlanItemDto()
            {
                Name = subscriptionPlan.Name, // Name of the plan
                Currency = subscriptionPlan.Currency.ToString().ToUpper(), // Currency in uppercase (e.g., USD)
                Description = "", // Optional description field
                Amount = (int)(subscriptionPlan.Price * 100), // Amount in the smallest currency unit (e.g., cents or paise)
            }
        });
        
         // Return the Razorpay plan ID if the creation was successful
        return razorpayPlan.Data?.Id;
    }
}
