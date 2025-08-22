namespace AccountsAPIs.Services;

public class TenantSubscriptionService : ITenantSubscriptionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TenantSubscriptionService> _logger;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public TenantSubscriptionService(IUnitOfWork unitOfWork, ILogger<TenantSubscriptionService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Extract user ID from JWT token claims for audit purposes
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
    }

    // Retrieves all tenant subscriptions from the database including the creator user.
    public async Task<ServiceResponse<IEnumerable<TenantSubscriptionDto>>> GetAllTenantSubscriptionsAsync()
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<IEnumerable<TenantSubscriptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve tenant subscriptions. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to retrieve all tenant subscriptions.");

            // Fetch all tenant subscriptions with their related plan and creator user
            var subscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetAllAsync()
                .Include(i => i.Plan)
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} tenant subscriptions.", subscriptions.Count);

            // Map entities to DTOs
            serviceResponse.Data = subscriptions.Adapt<IEnumerable<TenantSubscriptionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscriptions retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving tenant subscriptions.");
        }

        return serviceResponse;
    }

    // Retrieves a single tenant subscription by its unique ID.
    public async Task<ServiceResponse<TenantSubscriptionDto>> GetTenantSubscriptionByIdAsync(Guid tenantSubscriptionId)
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to retrieve the tenant subscription. Please try again."
        };

        try
        {
            _logger.LogInformation("Fetching tenant subscription with ID: {TenantSubscriptionId}", tenantSubscriptionId);

            // Query tenant subscription by ID with related plan and creator
            var subscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.Id == tenantSubscriptionId)
                .Include(i => i.Plan)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (subscription == null)
            {
                _logger.LogWarning("No tenant subscription found with ID: {TenantSubscriptionId}", tenantSubscriptionId);
                serviceResponse.Message = "Tenant subscription not found.";
                return serviceResponse;
            }

            _logger.LogInformation("Tenant subscription found with ID: {TenantSubscriptionId}", tenantSubscriptionId);

            serviceResponse.Data = subscription.Adapt<TenantSubscriptionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving tenant subscription with ID: {TenantSubscriptionId}", tenantSubscriptionId);
        }

        return serviceResponse;
    }

    // Creates a new tenant subscription if it doesn't already exist for the tenant and plan.
    public async Task<ServiceResponse<TenantSubscriptionDto>> CreateTenantSubscriptionAsync(TenantSubscriptionDto tenantSubscriptionDto)
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to create tenant subscription. Please try again later."
        };

        try
        {
            _logger.LogInformation("Attempting to create a new tenant subscription for PlanId: {PlanId}", tenantSubscriptionDto.PlanId);

            // Check if subscription already exists for tenant (assuming you have tenant info in DTO or context)
            var existingSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.PlanId == tenantSubscriptionDto.PlanId && w.Id == tenantSubscriptionDto.Id)
                .SingleOrDefaultAsync();

            if (existingSubscription != null)
            {
                _logger.LogWarning("Tenant subscription for PlanId {PlanId} already exists.", tenantSubscriptionDto.PlanId);
                serviceResponse.Message = "Tenant subscription already exists for this plan.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Ensure string properties in the DTO are trimmed
            tenantSubscriptionDto = TrimDtoStringPropsUtil.TrimDtoStringProps(tenantSubscriptionDto);

            // If TenantId is not provided, set it to the default tenant ID
            if (tenantSubscriptionDto.TenantId == Guid.Empty || tenantSubscriptionDto.TenantId == null)
            {
                tenantSubscriptionDto.TenantId = _tenantId;
            }

            // Map DTO to entity
            var newSubscription = tenantSubscriptionDto.Adapt<TenantSubscription>();

            // Set audit fields
            newSubscription.CreatedByUserId = _userId;
            newSubscription.LastModifiedByUserId = _userId;

            // Insert the new subscription
            await _unitOfWork.TenantSubscriptionRepo.InsertAsync(newSubscription);

            // Save changes to database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist new tenant subscription for PlanId: {PlanId}", tenantSubscriptionDto.PlanId);
                return serviceResponse;
            }

            _logger.LogInformation("Tenant subscription created successfully with ID: {TenantSubscriptionId}", newSubscription.Id);

            serviceResponse.Data = newSubscription.Adapt<TenantSubscriptionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while creating tenant subscription for PlanId: {PlanId}", tenantSubscriptionDto.PlanId);
        }

        return serviceResponse;
    }

    // Updates an existing tenant subscription.
    public async Task<ServiceResponse<TenantSubscriptionDto>> UpdateTenantSubscriptionAsync(TenantSubscriptionDto tenantSubscriptionDto)
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to update tenant subscription. Please try again."
        };

        try
        {
            _logger.LogInformation("Updating tenant subscription with ID: {TenantSubscriptionId}", tenantSubscriptionDto.Id);

            // Retrieve existing subscription from DB
            var existingSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.Id == tenantSubscriptionDto.Id)
                .SingleOrDefaultAsync();

            if (existingSubscription == null)
            {
                _logger.LogWarning("Tenant subscription not found with ID: {TenantSubscriptionId}", tenantSubscriptionDto.Id);
                serviceResponse.Message = "Tenant subscription not found.";
                return serviceResponse;
            }

            // Ensure string properties in the DTO are trimmed
            tenantSubscriptionDto = TrimDtoStringPropsUtil.TrimDtoStringProps(tenantSubscriptionDto);

            // If TenantId is not provided, set it to the default tenant ID
            if (tenantSubscriptionDto.TenantId == Guid.Empty || tenantSubscriptionDto.TenantId == null)
            {
                tenantSubscriptionDto.TenantId = _tenantId;
            }

            // Map updated data onto existing entity
            tenantSubscriptionDto.Adapt(existingSubscription);

            // Update audit fields
            existingSubscription.LastModifiedByUserId = _userId;

            // Update the subscription entity
            _unitOfWork.TenantSubscriptionRepo.Update(existingSubscription);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes for tenant subscription ID: {TenantSubscriptionId}", tenantSubscriptionDto.Id);
                return serviceResponse;
            }

            _logger.LogInformation("Tenant subscription with ID {TenantSubscriptionId} updated successfully.", tenantSubscriptionDto.Id);

            serviceResponse.Data = existingSubscription.Adapt<TenantSubscriptionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating tenant subscription with ID: {TenantSubscriptionId}", tenantSubscriptionDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a tenant subscription by its unique ID.
    public async Task<ServiceResponse<bool>> DeleteTenantSubscriptionAsync(Guid tenantSubscriptionId)
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tenant subscription. Please try again later."
        };

        try
        {
            _logger.LogInformation("Deleting tenant subscription with ID: {TenantSubscriptionId}", tenantSubscriptionId);

            // Fetch subscription to ensure existence
            var subscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.Id == tenantSubscriptionId)
                .SingleOrDefaultAsync();

            if (subscription == null)
            {
                _logger.LogWarning("No tenant subscription found with ID: {TenantSubscriptionId}", tenantSubscriptionId);
                serviceResponse.Message = "Tenant subscription not found.";
                return serviceResponse;
            }

            // Delete subscription
            _unitOfWork.TenantSubscriptionRepo.Delete(subscription);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete tenant subscription with ID: {TenantSubscriptionId}", tenantSubscriptionId);
                return serviceResponse;
            }

            _logger.LogInformation("Tenant subscription with ID: {TenantSubscriptionId} deleted.", tenantSubscriptionId);

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while deleting tenant subscription with ID: {TenantSubscriptionId}", tenantSubscriptionId);
        }

        return serviceResponse;
    }

    // Deletes multiple tenant subscriptions by their unique IDs.
    public async Task<ServiceResponse<bool>> DeleteTenantSubscriptionsAsync(List<Guid> tenantSubscriptionIds)
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tenant subscriptions. Please try again later."
        };

        try
        {
            _logger.LogInformation("Bulk deletion of {Count} tenant subscriptions initiated.", tenantSubscriptionIds.Count);

            // Fetch subscriptions to delete
            var subscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => tenantSubscriptionIds.Contains(w.Id))
                .ToListAsync();

            if (subscriptions == null || subscriptions.Count == 0)
            {
                _logger.LogWarning("No matching tenant subscriptions found to delete.");
                serviceResponse.Message = "No matching tenant subscriptions found.";
                return serviceResponse;
            }

            // Delete subscriptions in bulk
            _unitOfWork.TenantSubscriptionRepo.Delete(subscriptions);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete tenant subscriptions in bulk.");
                return serviceResponse;
            }

            _logger.LogInformation("Successfully deleted {Count} tenant subscriptions.", subscriptions.Count);

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscriptions deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while bulk deleting tenant subscriptions.");
        }

        return serviceResponse;
    }

    // Creates a new tenant subscription if it doesn't already exist for the tenant and plan.
    public async Task<ServiceResponse<TenantSubscriptionDto>> PurchaseTenantSubscriptionPlanAsync(TenantSubscriptionPurchaseDto tenantSubscriptionPurchaseDto)
    {
        // Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to process tenant subscription purchase. Please try again later.",
        };

        try
        {
            // Check if the tenant has indicated willingness to file GST but has not provided a GST number
            if (tenantSubscriptionPurchaseDto.IsWillingToFileGst && string.IsNullOrEmpty(tenantSubscriptionPurchaseDto.GstNumber))
            {
                _logger.LogWarning("GST number is missing for the tenant subscription purchase. TenantId: {TenantId}, PlanId: {PlanId}. The tenant has indicated willingness to file GST but no GST number was provided.",
                                    tenantSubscriptionPurchaseDto.TenantId, tenantSubscriptionPurchaseDto.PlanId);
                serviceResponse.Message = "A GST number is required to proceed with the subscription purchase, as the tenant is willing to file GST.";
                return serviceResponse;
            }

            _logger.LogInformation("Attempting to purchase a new tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);

            // Retrieve the subscription plan by its ID and return an error if not found
            var subscriptionPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Id == tenantSubscriptionPurchaseDto.PlanId)
                .SingleOrDefaultAsync();

            if (subscriptionPlan == null)
            {
                _logger.LogWarning("Subscription plan not found for PlanId: {PlanId}.", tenantSubscriptionPurchaseDto.PlanId);
                serviceResponse.Message = "Subscription plan not found.";
                return serviceResponse;
            }

            // Trim string properties in the DTO to eliminate any unnecessary whitespace
            tenantSubscriptionPurchaseDto = TrimDtoStringPropsUtil.TrimDtoStringProps(tenantSubscriptionPurchaseDto);

            // If TenantId is not provided, set it to the default tenant ID
            tenantSubscriptionPurchaseDto.TenantId = tenantSubscriptionPurchaseDto.TenantId == Guid.Empty ? _tenantId : tenantSubscriptionPurchaseDto.TenantId;

            // Map the DTO to the subscription entity
            var newSubscription = tenantSubscriptionPurchaseDto.Adapt<TenantSubscription>();

            // Set the subscription's start and end dates
            newSubscription.StartDate = DateTimeOffset.UtcNow.Date;
            newSubscription.EndDate = tenantSubscriptionPurchaseDto.Frequency switch
            {
                SubscriptionFrequenciesEnum.Monthly => DateTimeOffset.UtcNow.Date.AddMonths(1),
                SubscriptionFrequenciesEnum.Yearly => DateTimeOffset.UtcNow.Date.AddYears(1),
                _ => throw new ArgumentException("Invalid subscription frequency.")
            };

            // Set audit fields for tracking user actions
            newSubscription.CreatedByUserId = _userId;
            newSubscription.LastModifiedByUserId = _userId;

            // Insert the new subscription into the repository
            await _unitOfWork.TenantSubscriptionRepo.InsertAsync(newSubscription);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist new tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);
                serviceResponse.Message = "Failed to save the subscription.";
                return serviceResponse;
            }

            var billingDetail = tenantSubscriptionPurchaseDto.Adapt<BillingDetail>();
            billingDetail.CreatedByUserId = _userId;
            billingDetail.LastModifiedByUserId = _userId;

            // Insert the new address into the repository
            await _unitOfWork.BillingDetailRepo.InsertAsync(billingDetail);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist new address for BillingDetail: {BillingDetailId}", billingDetail.Id);
                serviceResponse.Message = "Failed to save the billing address.";
                return serviceResponse;
            }

            // Log the successful creation of the tenant subscription
            _logger.LogInformation("Tenant subscription successfully created with ID: {TenantSubscriptionId}", newSubscription.Id);

            // Map the newly created subscription entity to a DTO and return a successful response
            serviceResponse.Data = newSubscription.Adapt<TenantSubscriptionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription completed successfully.";
        }
        catch (Exception ex)
        {
            // Log any unexpected errors that occur during the subscription creation process
            _logger.LogError(ex, "An unexpected error occurred while purchasing tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);
        }

        return serviceResponse;
    }
}
