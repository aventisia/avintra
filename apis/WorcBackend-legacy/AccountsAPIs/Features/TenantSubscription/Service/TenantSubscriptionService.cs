namespace AccountsAPIs.Services;

public class TenantSubscriptionService : ITenantSubscriptionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITopUpService _topUpService;
    private readonly ILogger<TenantSubscriptionService> _logger;
    private readonly IEmailService _emailService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IAzureBlobStorageService _azureBlobStorageService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;
    private readonly string? _username;

    public TenantSubscriptionService(
        IUnitOfWork unitOfWork,
        ILogger<TenantSubscriptionService> logger,
        IHttpContextAccessor httpContextAccessor,
        ITopUpService topUpService,
        IEmailService emailService,
        EnvironmentConfig environmentConfig,
        ICurrentTenantService currentTenantService,
        IAzureBlobStorageService azureBlobStorageService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Extract user ID from JWT token claims for audit purposes
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname");
        _topUpService = topUpService;
        _emailService = emailService;
        _environmentConfig = environmentConfig;
        _currentTenantService = currentTenantService;
        _azureBlobStorageService = azureBlobStorageService;
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

            // Fetch all tenant subscriptions with their related plan and creator user
            var subscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId
                )
                .Include(i => i.Plan)
                .Include(i => i.CreatedByUser)
                .ToListAsync();


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

            // Retrieve the subscription plan by its ID and return an error if not found
            var subscriptionPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Id == tenantSubscriptionDto.PlanId)
                .SingleOrDefaultAsync();

            if (subscriptionPlan == null)
            {
                _logger.LogWarning("Subscription plan not found for PlanId: {PlanId}.", tenantSubscriptionDto.PlanId);
                serviceResponse.Message = "Subscription plan not found.";
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
            newSubscription.MaxCredits = subscriptionPlan.MaxCredits;
            newSubscription.TenantId = _tenantId;
            newSubscription.MaxPublishedItems = subscriptionPlan.MaxPublishedItems;
            newSubscription.MaxSpaces = subscriptionPlan.MaxSpaces;
            newSubscription.MaxUsers = subscriptionPlan.MaxUsers;
            newSubscription.StorageLimitMB = subscriptionPlan.StorageLimitMB;
            newSubscription.HistoryRetentionDays = subscriptionPlan.HistoryRetentionDays;

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

            // Fetch existing tenant subscription (if any), including plan and creator information
            var existingTenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId && !w.IsActive)
                .FirstOrDefaultAsync();

            // IMPORTANT NOTE: 
            // For condition to check existing subscription: Since tenant should have only one active 
            // subscription at max so if tenant has no active subscription then means onboarding is not completed yet 
            // user is yet to purchase first free/paid plan.
            // 
            // With above logic even if user comes after few days of half completed onboarding still they will be able to use the same
            // onboarding flow without any issues.
            //
            // Once user has completed onboarding, then there will always be an 1 active subscription at 
            // any point of time even that subscription's status is expired. Users will be able to login even if subscription 
            // is expired they won't be able to access any paid features. In future, we may downgrade user's subscription to 
            // free Starter plan automatically once subscription is expired. In that case also there will be always one active subscription.

            // If no existing subscription, initialize a new one
            var tenantSubscription = existingTenantSubscription == null
                                    ? tenantSubscriptionPurchaseDto.Adapt<TenantSubscription>()
                                    : existingTenantSubscription;

            // Map entity and dto properties as per Pro plan requirements
            tenantSubscription.Frequency = tenantSubscriptionPurchaseDto.Frequency;
            tenantSubscription.Status = SubscriptionStatusTypesEnum.Initiated;
            tenantSubscription.PlanId = tenantSubscriptionPurchaseDto.PlanId;
            tenantSubscription.IsActive = false;
            tenantSubscription.TenantId = _tenantId;
            tenantSubscription.NextBillingDate = DateTimeOffset.UtcNow.Date;
            tenantSubscription.MaxCredits = subscriptionPlan.MaxCredits;
            tenantSubscription.MaxPublishedItems = subscriptionPlan.MaxPublishedItems;
            tenantSubscription.MaxSpaces = subscriptionPlan.MaxSpaces;
            tenantSubscription.MaxUsers = subscriptionPlan.MaxUsers;
            tenantSubscription.StorageLimitMB = subscriptionPlan.StorageLimitMB;
            tenantSubscription.HistoryRetentionDays = subscriptionPlan.HistoryRetentionDays;
            tenantSubscription.LastModifiedByUserId = _userId;

            // If plan is Starter, activate immediately
            if (subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter)
            {
                tenantSubscription.Status = SubscriptionStatusTypesEnum.Active;
                tenantSubscription.IsActive = true;
                // Since Starter plan starts immediately, need to set NextBillingDate accordingly.
                tenantSubscription.NextBillingDate = tenantSubscriptionPurchaseDto.Frequency == SubscriptionFrequenciesEnum.Monthly
                                                        ? DateTimeOffset.UtcNow.Date.AddMonths(1)
                                                        : DateTimeOffset.UtcNow.Date.AddYears(1);
            }

            // Insert tenant subscription if new
            if (existingTenantSubscription == null)
            {
                tenantSubscription.CreatedByUserId = _userId;
                await _unitOfWork.TenantSubscriptionRepo.InsertAsync(tenantSubscription);
            }
            else
            {
                _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);
            }

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);
                return serviceResponse;
            }

            // Map the subscription purchase DTO to a new BillingDetail entity
            var billingDetail = tenantSubscriptionPurchaseDto.Adapt<BillingDetail>();
            billingDetail.SubscriptionId = tenantSubscription.Id;
            billingDetail.TenantId = _tenantId;

            // Fetch the current user's information based on their User ID
            var currentUser = await _unitOfWork.AccountUserRepo.GetByConditionAsync(w => w.Id == _userId).FirstOrDefaultAsync();
            if (currentUser != null)
            {
                // Set the BillingEmail to the current user's username
                billingDetail.BillingEmail = currentUser?.UserName;

                // Set the ContactPerson to the full name (First and Last Name) of the current user
                billingDetail.ContactPerson = $"{currentUser?.FirstName} {currentUser.LastName}";
            }

            // Check if billing details already exist for the tenant and subscription
            var existingBillingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId && w.SubscriptionId == tenantSubscription.Id)
                .FirstOrDefaultAsync();

            if (existingBillingDetail != null)
            {
                // Update the existing billing details
                existingBillingDetail.BillingEmail = billingDetail.BillingEmail ?? existingBillingDetail.BillingEmail;
                existingBillingDetail.ContactPerson = billingDetail.ContactPerson ?? existingBillingDetail.ContactPerson;
                existingBillingDetail.LastModifiedByUserId = _userId;

                // Update the billing detail in the repository
                _unitOfWork.BillingDetailRepo.Update(existingBillingDetail);
            }
            else
            {
                // Set audit fields for the new billing detail
                billingDetail.CreatedByUserId = _userId;
                billingDetail.LastModifiedByUserId = _userId;

                // Insert the new billing detail into the repository
                await _unitOfWork.BillingDetailRepo.InsertAsync(billingDetail);
            }

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Unable to persist billing details. TenantId: {TenantId}, BillingDetailId: {BillingDetailId}", _tenantId, billingDetail.Id);
                return serviceResponse;
            }

            string? razorpayOrderId = null;

            if (subscriptionPlan.Type != SubscriptionPlanTypeEnum.Starter)
            {
                // Fetch the tenant details from the database using the Tenant ID
                var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstAsync();

                // Create a new Top-up order (non-recurring payment) using the top-up service
                var subscriptionOrder = await _topUpService.CreateTopUpAsync(new RazorpayOrderRequestDto()
                {
                    Amount = subscriptionPlan.Price,
                    Currency = subscriptionPlan.Currency,
                    Credits = 0,
                    IncludeTax = true,
                    Type = CreditTypesEnum.Subscription,
                    SubscriptionId = tenantSubscription.Id
                });

                // Check if the subscription order creation was successful
                if (subscriptionOrder?.Data != null || subscriptionOrder.StatusCode == 200)
                {
                    razorpayOrderId = subscriptionOrder.Data.RazorpayId;
                    _logger.LogInformation("Razorpay subscription created successfully for Tenant {TenantId}. Razorpay Order ID: {RazorpayOrderId}",
                                           tenant.Id, razorpayOrderId);
                }
                else
                {
                    _logger.LogWarning("Failed to update Razorpay subscription for Tenant {TenantId}. Reason: {Message}",
                                       tenantSubscription.TenantId, subscriptionOrder?.Message ?? "Unknown error");
                    serviceResponse.Message = subscriptionOrder.Message;
                    return serviceResponse;
                }

                tenantSubscription.IsRecurringPayment = tenantSubscriptionPurchaseDto.IsRecurringPayment;
                tenantSubscription.LastModifiedByUserId = _userId;
                tenantSubscription.NextBillingDate = DateTimeOffset.UtcNow.Date; // Not setting next billing date until payment is successful

                // Update the new subscription into the repository
                _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

                // Save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to persist new tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);
                    return serviceResponse;
                }
            }
            else
            {
                // Create and assign initial credits for the tenant based on the subscription
                var newTenantCredit = new TenantCredit()
                {
                    CreditedOn = DateTimeOffset.UtcNow.Date,
                    ExpiredOn = DateTimeOffset.UtcNow.Date.AddMonths(1),
                    SubscriptionId = tenantSubscription.Id,
                    AvailableCredits = subscriptionPlan.MaxCredits,
                    Type = CreditTypesEnum.Subscription,
                    TenantId = _tenantId,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                };

                // Save tenant credit to the database
                await _unitOfWork.TenantCreditRepo.InsertAsync(newTenantCredit);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Unable to persist tenant credit. TenantId: {TenantId}, TenantCreditId: {TenantCreditId}", _tenantId, newTenantCredit.Id);
                    return serviceResponse;
                }


                // If the subscription plan is not 'Starter', check and update existing tenant credits
                var tenantCredits = await _unitOfWork.TenantCreditRepo
                    .GetByConditionAsync(w =>
                        w.Id != newTenantCredit.Id &&
                        w.TenantId == _tenantId &&
                        w.ExpiredOn.Date >= DateTimeOffset.UtcNow.Date
                    )
                    .ToListAsync();

                if (tenantCredits.Any())
                {
                    foreach (var tenantCredit in tenantCredits)
                    {
                        tenantCredit.ExpiredOn = DateTimeOffset.UtcNow.Date.AddDays(-1);
                        tenantCredit.LastModifiedByUserId = _userId;

                        // Update the expired tenant credits in the repository
                        _unitOfWork.TenantCreditRepo.Update(tenantCredit);
                    }

                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Unable to update tenant credits expiration. TenantId: {TenantId}", _tenantId);
                        return serviceResponse;
                    }
                }
            }


            // Map the tenant subscription entity to a DTO for response
            var tenantSubscriptionDto = tenantSubscription.Adapt<TenantSubscriptionDto>();
            tenantSubscriptionDto.RazorpayOrderId = razorpayOrderId;

            // Set the service response with the DTO and success metadata
            serviceResponse.Data = tenantSubscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription completed successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while purchasing tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);
        }

        return serviceResponse;
    }

    // Retrieves the current subscription plan for a tenant.
    public async Task<ServiceResponse<SubscriptionDashboardDto>> GetCurrentTenantSubscriptionPlanAsync()
    {
        // Initialize the response object with failure message by default
        var serviceResponse = new ServiceResponse<SubscriptionDashboardDto>
        {
            Data = null,
            Message = "Failed to retrieve the current tenant subscription plan. Please try again."
        };

        try
        {
            // Log information about the process of fetching the current tenant's subscription plan

            // Initialize an empty SubscriptionDashboardDto to store subscription data
            SubscriptionDashboardDto? subscriptionDashboardDto = new();

            // Fetch the current tenant's active subscription, considering user and tenant constraints
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.IsActive &&
                    w.TenantId == _tenantId
                )
                .Include(i => i.Plan)
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync();

            // If no subscription is found, log a warning and return a failure message
            if (tenantSubscription == null)
            {
                _logger.LogWarning("No active subscription found for tenant ID: {TenantId}", _tenantId);
                serviceResponse.Message = "No subscription plan found for the current tenant.";
                return serviceResponse;
            }

            // Query to get all negative and positive credits, including expired negative credits
            double availableCredits = await _unitOfWork.TenantCreditRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    w.ExpiredOn.Date > DateTimeOffset.UtcNow.Date
                )
                .SumAsync(sm => sm.AvailableCredits);

            // Fetch the latest billing details for the current tenant
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // Extract the current subscription plan for easier reference
            var currentPlan = tenantSubscription.Plan;
            var sizeInBytes = await _azureBlobStorageService.GetContainerSizeAsync(_currentTenantService.CurrentTenantContainerName);
            var sizeInMB = Math.Ceiling((double)sizeInBytes / (1024 * 1024)); // Apply ceiling first

            if (currentPlan != null)
            {
                var effectiveMaxSpaces = _environmentConfig.IsCommunityDeployment ? 1 : currentPlan.MaxSpaces;
                var effectiveHistoryRetentionDays = _environmentConfig.IsCommunityDeployment ? 1 : currentPlan.HistoryRetentionDays;

                // Populate the subscription plan details for the dashboard
                subscriptionDashboardDto.CurrentPlan = new CurrentSubscriptionPlanDto()
                {
                    PlanId = currentPlan.Id,
                    PlanName = currentPlan.Name,
                    PlanType = currentPlan.Type,
                    SubscriptionId = tenantSubscription.Id,
                    Frequency = tenantSubscription.Frequency,
                    Price = currentPlan.Price,
                    Currency = currentPlan.Currency,
                    AvailableCredits = availableCredits,
                    ExpiredOn = tenantSubscription.NextBillingDate,
                    IsActive = tenantSubscription.NextBillingDate.Date > DateTimeOffset.UtcNow.Date,
                    IsRecurringPayment = tenantSubscription.IsRecurringPayment,
                    RazorpaySubscriptionId = tenantSubscription?.RazorpaySubscriptionId,
                    Feature = new CurrentSubscriptionPlanDetailDto()
                    {
                        StorageLimitMB = currentPlan.StorageLimitMB,
                        MaxSpaces = effectiveMaxSpaces,
                        MaxUsers = currentPlan.MaxUsers,
                        MaxCredits = currentPlan.MaxCredits,
                        HistoryRetentionDays = effectiveHistoryRetentionDays,
                        MaxPublishedItems = currentPlan.MaxPublishedItems
                    },
                    // TODO: Calculate the resource usage dynamically based on actual usage data
                    // Currently, all resource usage values are set to 0. 
                    Usage = new List<ResourceUsageDto>()
                    {
                        new ResourceUsageDto()
                        {
                            ResourceName = "PublishedItems",
                            Used = 0,
                            Limit = currentPlan.MaxPublishedItems,
                            Unit = "number"
                        },
                        new ResourceUsageDto()
                        {
                            ResourceName = "Spaces",
                            Used = await _unitOfWork.SpaceRepo.GetByConditionAsync(w=>w.TenantId == _tenantId).CountAsync(),
                            Limit = effectiveMaxSpaces,
                            Unit = "number"
                        },
                        new ResourceUsageDto()
                        {

                            ResourceName = "Storage",
                            Used = sizeInMB,
                            Limit = currentPlan.StorageLimitMB,
                            Unit = "MB"
                        }
                    },
                };
            }

            // Calculate the subscription fee based on the plan's frequency. Price in SubscriptionPlan entity is Price per month.
            var subscriptionFee = currentPlan.Price;

            // Calculate the tax (18% of the subscription fee)
            var tax = subscriptionFee * 0.18m;  // 'm' denotes decimal literal

            // Calculate the total amount (subscription fee + tax)
            var totalAmount = subscriptionFee + tax;
            // Check if the NextBillingDate is not set (i.e., it's null)
            if (tenantSubscription?.NextBillingDate == null) // TO CHECK
            {
                // If the subscription frequency is Monthly, set the NextBillingDate to 1 month after the CreatedOn date
                // Otherwise, if it's Annual, set the NextBillingDate to 1 year after the CreatedOn date
                tenantSubscription.NextBillingDate = tenantSubscription.Frequency == SubscriptionFrequenciesEnum.Monthly
                    ? tenantSubscription.CreatedOn.AddMonths(1).Date
                    : tenantSubscription.CreatedOn.AddYears(1).Date;
            }

            // Populate the next payment details
            subscriptionDashboardDto.NextPayment = new NextPaymentDetailDto()
            {
                DueDate = tenantSubscription.NextBillingDate, // TO CHECK
                SubscriptionFee = subscriptionFee,
                Tax = tax,
                TotalAmount = totalAmount,
            };


            // Populate the service response with the subscription data and a success message
            serviceResponse.Data = subscriptionDashboardDto;
            serviceResponse.StatusCode = 200; // HTTP OK
            serviceResponse.Message = "Current tenant subscription plan retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving the current tenant subscription plan for tenant ID: {TenantId}", _tenantId);
        }

        // Return the service response (success or failure)
        return serviceResponse;
    }

    // Upgrades the subscription plan for a tenant. If no subscription exists, creates a new one.
    public async Task<ServiceResponse<TenantSubscriptionDto>> UpgradeSubscriptionPlanAsync(TenantSubscriptionPurchaseDto tenantSubscriptionPurchaseDto)
    {
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to upgrade tenant subscription. Please try again later.",
        };

        try
        {

            // Retrieve the selected subscription plan
            var subscriptionPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Id == tenantSubscriptionPurchaseDto.PlanId)
                .SingleOrDefaultAsync();

            if (subscriptionPlan == null)
            {
                _logger.LogWarning("Subscription plan not found for PlanId: {PlanId}.", tenantSubscriptionPurchaseDto.PlanId);
                serviceResponse.Message = "Subscription plan not found.";
                return serviceResponse;
            }

            // Sanitize input data
            tenantSubscriptionPurchaseDto = TrimDtoStringPropsUtil.TrimDtoStringProps(tenantSubscriptionPurchaseDto);

            // Fetch existing tenant subscription (if any), including plan and creator information
            var exitingtSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.IsActive &&
                    w.TenantId == _tenantId
                )
                .Include(i => i.Plan)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (exitingtSubscription != null)
            {
                // Early return if the plan IDs are identical
                if (exitingtSubscription.PlanId == tenantSubscriptionPurchaseDto.PlanId)
                {
                    serviceResponse.Data = exitingtSubscription.Adapt<TenantSubscriptionDto>();
                    serviceResponse.StatusCode = 200;
                    serviceResponse.Message = "No changes required. The subscription plan is already up to date.";
                    return serviceResponse;
                }
            }

            // Fetch existing tenant subscription (if any), including plan and creator information
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    w.PlanId == tenantSubscriptionPurchaseDto.PlanId &&
                    w.Status == SubscriptionStatusTypesEnum.Initiated
                )
                .Include(i => i.Plan)
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync();

            if (tenantSubscription == null || tenantSubscription.CreatedOn.Date != DateTimeOffset.UtcNow.Date)
            {
                // No existing subscription — create new
                tenantSubscription = tenantSubscriptionPurchaseDto.Adapt<TenantSubscription>();
                tenantSubscription.Id = Guid.NewGuid();
                tenantSubscription.PlanId = subscriptionPlan.Id;
                tenantSubscription.TenantId = _tenantId;
                tenantSubscription.RazorpaySubscriptionId = exitingtSubscription?.RazorpaySubscriptionId;
                tenantSubscription.IsActive = subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter ? true : false;
                tenantSubscription.Status = subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter ? SubscriptionStatusTypesEnum.Active : SubscriptionStatusTypesEnum.Initiated;
                tenantSubscription.NextBillingDate = DateTimeOffset.UtcNow.Date;
                tenantSubscription.IsRecurringPayment = tenantSubscriptionPurchaseDto.IsRecurringPayment;
                tenantSubscription.CreatedByUserId = _userId;
                tenantSubscription.LastModifiedByUserId = _userId;
                tenantSubscription.MaxCredits = subscriptionPlan.MaxCredits;
                tenantSubscription.MaxPublishedItems = subscriptionPlan.MaxPublishedItems;
                tenantSubscription.MaxSpaces = subscriptionPlan.MaxSpaces;
                tenantSubscription.MaxUsers = subscriptionPlan.MaxUsers;
                tenantSubscription.StorageLimitMB = subscriptionPlan.StorageLimitMB;
                tenantSubscription.HistoryRetentionDays = subscriptionPlan.HistoryRetentionDays;

                await _unitOfWork.TenantSubscriptionRepo.InsertAsync(tenantSubscription);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to create tenant subscription. TenantId: {TenantId}, PlanId: {PlanId}", _tenantId, tenantSubscriptionPurchaseDto.PlanId);
                    return serviceResponse;
                }
            }

            string? razorpayOrderId = null;

            // Only create a Razorpay subscription if it doesn't already exist and the plan is not 'Starter'
            if (subscriptionPlan.Type != SubscriptionPlanTypeEnum.Starter)
            {
                // Fetch the tenant details from the database using the Tenant ID
                var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstAsync();

                // Create a new Top-up order (non-recurring payment) using the top-up service
                var subscriptionOrder = await _topUpService.CreateTopUpAsync(new RazorpayOrderRequestDto()
                {
                    Amount = subscriptionPlan.Price,
                    Currency = subscriptionPlan.Currency,
                    Credits = 0,
                    IncludeTax = true,
                    Type = CreditTypesEnum.Subscription,
                    SubscriptionId = tenantSubscription.Id
                });

                // Check if the subscription order creation was successful
                if (subscriptionOrder?.Data != null || subscriptionOrder.StatusCode == 200)
                {
                    razorpayOrderId = subscriptionOrder.Data.RazorpayId;
                    _logger.LogInformation("Razorpay subscription created successfully for Tenant {TenantId}. Razorpay Order ID: {RazorpayOrderId}",
                                           tenant.Id, razorpayOrderId);
                }
                else
                {
                    _logger.LogWarning("Failed to update Razorpay subscription for Tenant {TenantId}. Reason: {Message}",
                                       tenantSubscription.TenantId, subscriptionOrder?.Message ?? "Unknown error");
                    serviceResponse.Message = subscriptionOrder.Message;
                    return serviceResponse;
                }
            }
            else
            {
                // Create and assign initial credits for the tenant based on the subscription
                var tenantCredit = new TenantCredit()
                {
                    CreditedOn = DateTimeOffset.UtcNow,
                    ExpiredOn = DateTimeOffset.UtcNow.Date.AddMonths(1),
                    SubscriptionId = tenantSubscription.Id,
                    AvailableCredits = subscriptionPlan.MaxCredits,
                    TenantId = _tenantId,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                };

                // Save tenant credit to the database
                await _unitOfWork.TenantCreditRepo.InsertAsync(tenantCredit);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Unable to persist tenant credit. TenantId: {TenantId}, TenantCreditId: {TenantCreditId}", _tenantId, tenantCredit.Id);
                    return serviceResponse;
                }

            }

            // Map the tenant subscription entity to a DTO for response
            var tenantSubscriptionDto = tenantSubscription.Adapt<TenantSubscriptionDto>();
            tenantSubscriptionDto.RazorpayOrderId = razorpayOrderId;

            // Set the service response with the DTO and success metadata
            serviceResponse.Data = tenantSubscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription upgraded successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while upgrading the subscription. TenantId: {TenantId}, PlanId: {PlanId}", _tenantId, tenantSubscriptionPurchaseDto.PlanId);
        }

        return serviceResponse;
    }

    // Upgrades the subscription plan for a self-hosted tenant. If no existing active subscription is found, a new subscription is created.
    public async Task<ServiceResponse<TenantSubscriptionDto>> UpgradeSelfHostedSubscriptionPlanAsync(SelfHostedSubscriptionUpgradeDto selfHostedSubscriptionUpgradeDto)
    {
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to upgrade tenant subscription. Please try again later.",
        };

        try
        {

            // Retrieve the subscription plan the tenant wants to upgrade to
            var subscriptionPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Id == selfHostedSubscriptionUpgradeDto.PlanId)
                .SingleOrDefaultAsync();

            if (subscriptionPlan == null)
            {
                _logger.LogWarning("No subscription plan found with PlanId: {PlanId}.", selfHostedSubscriptionUpgradeDto.PlanId);
                serviceResponse.Message = "Subscription plan not found.";
                return serviceResponse;
            }

            // Sanitize input data
            selfHostedSubscriptionUpgradeDto = TrimDtoStringPropsUtil.TrimDtoStringProps(selfHostedSubscriptionUpgradeDto);

            // Try to fetch the existing active tenant subscription (if any)
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.IsActive && w.TenantId == _tenantId
                )
                .Include(i => i.Plan)
                .SingleOrDefaultAsync();

            var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstOrDefaultAsync();

            // Log and handle failure if email verification fails
            if (!await _emailService.SendEmailUsingTemplate(
                EmailTypesEnum.SubscriptionPlanUpgrade,
                _environmentConfig.SalesEmails,
                new Dictionary<string, string>()
                {
                {"{{TenantName}}", tenant.Name },
                {"{{Email}}", _username },
                {"{{CurrentPlan}}", tenantSubscription?.Plan?.Type.ToString() ?? "None" },
                {"{{RequestedPlan}}", "Self-Hosted" },
                {"{{RequestedOn}}", DateTimeOffset.UtcNow.Date.ToString("MMMM d, yyyy") }
                }))
            {
                _logger.LogError("Failed to send email for subscription upgrade request to {SalesEmails}. Request type: {EmailType}.", _environmentConfig.SalesEmails, EmailTypesEnum.ContactUsRequest);
                return serviceResponse;
            }

            // Map the tenant subscription entity to a DTO for response
            var tenantSubscriptionDto = tenantSubscription?.Adapt<TenantSubscriptionDto>();

            // Set the successful service response with the DTO
            serviceResponse.Data = tenantSubscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription upgraded successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while upgrading subscription for TenantId: {TenantId}, PlanId: {PlanId}", _tenantId, selfHostedSubscriptionUpgradeDto.PlanId);
        }

        return serviceResponse;
    }

    // Cancels the subscription plan for a tenant. If no active subscription exists, the cancellation is skipped.
    public async Task<ServiceResponse<TenantSubscriptionDto>> CancelSubscriptionAsync(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to cancel tenant subscription. Please try again later.",
        };

        try
        {

            // Fetch the existing tenant subscription to be canceled
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.Id == subscriptionUpdateRequestDto.SubscriptionId && w.IsActive)
                .SingleOrDefaultAsync();

            // If no active subscription is found, return an appropriate message
            if (tenantSubscription == null)
            {
                _logger.LogWarning("No active subscription found for TenantId: {TenantId}, SubscriptionId: {SubscriptionId}.", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                serviceResponse.Message = "No active subscription found to cancel.";
                return serviceResponse;
            }

            // Deactivate the subscription (mark it as inactive)
            tenantSubscription.IsActive = false;
            tenantSubscription.LastModifiedByUserId = _userId;

            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to deactivate tenant subscription. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                return serviceResponse;
            }

            _logger.LogInformation("Tenant subscription deactivated. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);

            // Map the tenant subscription entity to a DTO for response (so client gets details of canceled subscription)
            var tenantSubscriptionDto = tenantSubscription.Adapt<TenantSubscriptionDto>();

            // Set the service response with the DTO and success metadata
            serviceResponse.Data = tenantSubscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription cancelled successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while cancelling the subscription. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }

    // Update the subscription plan for a tenant. If no active subscription exists, the cancellation is skipped.
    public async Task<ServiceResponse<TenantSubscriptionDto>> UpdateSubscriptionAsync(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to update tenant subscription. Please try again later.",
        };

        try
        {
            _logger.LogInformation("Processing subscription updation for TenantId: {TenantId}, SubscriptionId: {SubscriptionId}",
                                    _tenantId, subscriptionUpdateRequestDto.SubscriptionId);

            // Check if the provided PlanId is empty (invalid)
            if (subscriptionUpdateRequestDto.PlanId == Guid.Empty)
            {
                _logger.LogWarning("Invalid PlanId provided. PlanId is empty for TenantId: {TenantId}, SubscriptionId: {SubscriptionId}",
                                    _tenantId, subscriptionUpdateRequestDto.SubscriptionId);

                // Add a message to indicate that the PlanId is invalid
                serviceResponse.Message = "Invalid PlanId provided. Please provide a valid PlanId.";

                // Return the service response with the error message
                return serviceResponse;
            }

            // Fetch the existing active tenant subscription
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.Id == subscriptionUpdateRequestDto.SubscriptionId && w.IsActive)
                .Include(i => i.Plan)
                .SingleOrDefaultAsync();

            // Check if no active subscription exists
            if (tenantSubscription == null)
            {
                _logger.LogWarning("No active subscription found for TenantId: {TenantId}, SubscriptionId: {SubscriptionId}.",
                                    _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                serviceResponse.Message = "No active subscription found to update.";
                return serviceResponse;
            }

            // Fetch the subscription plan based on the provided PlanId and Frequency from the repository
            var subscriptionPlan = await _unitOfWork.SubscriptionPlanRepo
                .GetByConditionAsync(w => w.Id == subscriptionUpdateRequestDto.PlanId && w.Frequency == subscriptionUpdateRequestDto.Frequency)
                .SingleOrDefaultAsync();

            // Check if the subscription plan was found and ensure its type matches the expected type
            if (subscriptionPlan == null || tenantSubscription.Plan.Type != subscriptionPlan.Type)
            {
                _logger.LogWarning("No valid subscription plan found for PlanId: {PlanId}, Frequency: {Frequency}. " +
                                    "TenantId: {TenantId}, SubscriptionId: {SubscriptionId} could not be processed due to an invalid plan type.",
                                    subscriptionUpdateRequestDto.PlanId, subscriptionUpdateRequestDto.Frequency, _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                serviceResponse.Message = "The specified subscription plan is invalid.";
                return serviceResponse;
            }

            // Check if the current subscription already has the requested PlanId
            if (tenantSubscription.PlanId == subscriptionUpdateRequestDto.PlanId)
            {
                _logger.LogWarning("TenantId: {TenantId} already has the requested subscription plan PlanId: {PlanId}. No update needed.",
                                    _tenantId, subscriptionUpdateRequestDto.PlanId);
                serviceResponse.Message = "The tenant subscription already uses the requested plan.";
                return serviceResponse;
            }

            // Update the subscription (mark it as inactive)
            tenantSubscription.PlanId = subscriptionUpdateRequestDto.PlanId;
            tenantSubscription.Plan = subscriptionPlan;
            tenantSubscription.Frequency = subscriptionUpdateRequestDto.Frequency;
            tenantSubscription.LastModifiedByUserId = _userId;

            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to update tenant subscription. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                return serviceResponse;
            }


            // Map the tenant subscription entity to a DTO for response
            var tenantSubscriptionDto = tenantSubscription.Adapt<TenantSubscriptionDto>();

            // Set the service response with the DTO and success metadata
            serviceResponse.Data = tenantSubscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant subscription updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating the subscription. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }

    // Cancels the recurring payment for a tenant, keeping the subscription active but stopping future payments.
    public async Task<ServiceResponse<TenantSubscriptionDto>> CancelRecurringPaymentAsync(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<TenantSubscriptionDto>
        {
            Data = null,
            Message = "Failed to cancel recurring payment. Please try again later.",
        };

        try
        {

            // Fetch the active tenant subscription
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.Id == subscriptionUpdateRequestDto.SubscriptionId && w.IsActive)
                .SingleOrDefaultAsync();

            // If no active subscription is found, return an appropriate message
            if (tenantSubscription == null)
            {
                _logger.LogWarning("No active subscription found for TenantId: {TenantId}, SubscriptionId: {SubscriptionId}.", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                serviceResponse.Message = "No active subscription found to cancel recurring payment.";
                return serviceResponse;
            }

            // Update the tenant subscription with the new status
            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to update tenant subscription after canceling recurring payment. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                return serviceResponse;
            }


            // Map the tenant subscription entity to a DTO for response (so client gets details of canceled payment)
            var tenantSubscriptionDto = tenantSubscription.Adapt<TenantSubscriptionDto>();

            // Set the service response with the DTO and success metadata
            serviceResponse.Data = tenantSubscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Recurring payment canceled successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while canceling the recurring payment. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }

    public async Task<ServiceResponse<List<TenantSubscriptionInfoDto>>> GetAllSubscriptionsAsync()
    {
        // Initialize ServiceResponse with a default failed response
        var serviceResponse = new ServiceResponse<List<TenantSubscriptionInfoDto>>
        {
            Data = new List<TenantSubscriptionInfoDto>(),
            StatusCode = 200,
            Message = "Tenant subscriptions retrieved successfully."
        };

        try
        {

            // Fetch all active subscriptions with their history retention details
            var subscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.IsActive)
                .ToListAsync();


            // Check if any subscriptions are retrieved
            if (subscriptions.Any())
            {
                serviceResponse.Data = subscriptions.Select(s => new TenantSubscriptionInfoDto
                {
                    SubscriptionId = s.Id,
                    TenantId = s.TenantId,
                    HistoryRetentionDays = _environmentConfig.IsCommunityDeployment
                        ? 1
                        : s.HistoryRetentionDays
                }).ToList();
            }
            else
            {
                // If no subscriptions found, return an empty list
                serviceResponse.Data = new List<TenantSubscriptionInfoDto>();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving subscriptions.");
        }

        return serviceResponse;
    }
}