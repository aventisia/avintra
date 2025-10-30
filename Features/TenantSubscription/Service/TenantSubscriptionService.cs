namespace AccountsAPIs.Services;

public class TenantSubscriptionService : ITenantSubscriptionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISubscriptionService _subscriptionService;
    private readonly ICustomerService _customerService;
    private readonly ITopUpService _topUpService;
    private readonly ILogger<TenantSubscriptionService> _logger;
    private readonly DefaultTenantConfig _defaultTenantConfig;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public TenantSubscriptionService(IUnitOfWork unitOfWork,
    ILogger<TenantSubscriptionService> logger,
    IHttpContextAccessor httpContextAccessor,
    DefaultTenantConfig defaultTenantConfig,
    ISubscriptionService subscriptionService,
    ICustomerService customerService,
    ITopUpService topUpService)
    {
        _unitOfWork = unitOfWork;
        _subscriptionService = subscriptionService;
        _defaultTenantConfig = defaultTenantConfig;
        _logger = logger;

        // Extract user ID from JWT token claims for audit purposes
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _customerService = customerService;
        _topUpService = topUpService;
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

            var isNonDefaultTenant = _defaultTenantConfig.TenantId != _tenantId;

            // Fetch all tenant subscriptions with their related plan and creator user
            var subscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    (isNonDefaultTenant || w.CreatedByUserId == _userId) &&
                    w.TenantId == _tenantId
                )
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

            _logger.LogInformation("Attempting to purchase a new tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto);

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
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    w.PlanId == tenantSubscriptionPurchaseDto.PlanId &&
                    !w.IsActive &&
                    w.Status == SubscriptionStatusTypesEnum.Initiated &&
                    w.CreatedOn.Date == DateTimeOffset.UtcNow.Date
                )
                .Include(i => i.Plan)
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync();

            if (tenantSubscription == null)
            {
                // Map the DTO to the subscription entity
                tenantSubscription = tenantSubscriptionPurchaseDto.Adapt<TenantSubscription>();
                tenantSubscription.Frequency = tenantSubscriptionPurchaseDto.Frequency;
                tenantSubscription.Status = subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter ? SubscriptionStatusTypesEnum.Active : SubscriptionStatusTypesEnum.Initiated;
                tenantSubscription.IsActive = subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter ? true : false;
                tenantSubscription.NextBillingDate = DateTimeOffset.UtcNow.Date;
                tenantSubscription.MaxCredits = subscriptionPlan.MaxCredits;
                tenantSubscription.MaxPublishedItems = subscriptionPlan.MaxPublishedItems;
                tenantSubscription.MaxSpaces = subscriptionPlan.MaxSpaces;
                tenantSubscription.MaxUsers = subscriptionPlan.MaxUsers;
                tenantSubscription.StorageLimitMB = subscriptionPlan.StorageLimitMB;
                tenantSubscription.HistoryRetentionDays = subscriptionPlan.HistoryRetentionDays;

                // Set audit fields for tracking user actions
                tenantSubscription.CreatedByUserId = _userId;
                tenantSubscription.LastModifiedByUserId = _userId;

                // Insert the new subscription into the repository
                await _unitOfWork.TenantSubscriptionRepo.InsertAsync(tenantSubscription);

                // Save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to persist new tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);
                    return serviceResponse;
                }
            }
            else
            {
                // Existing subscription found, update the details
                tenantSubscription.Status = subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter ? SubscriptionStatusTypesEnum.Active : SubscriptionStatusTypesEnum.Initiated;
                tenantSubscription.PlanId = tenantSubscriptionPurchaseDto.PlanId;
                tenantSubscription.MaxCredits = subscriptionPlan.MaxCredits;
                tenantSubscription.MaxPublishedItems = subscriptionPlan.MaxPublishedItems;
                tenantSubscription.MaxSpaces = subscriptionPlan.MaxSpaces;
                tenantSubscription.MaxUsers = subscriptionPlan.MaxUsers;
                tenantSubscription.StorageLimitMB = subscriptionPlan.StorageLimitMB;
                tenantSubscription.HistoryRetentionDays = subscriptionPlan.HistoryRetentionDays;
                tenantSubscription.LastModifiedByUserId = _userId;

                // Update the subscription in the repository
                _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

                // Save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to persist tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);
                    return serviceResponse;
                }
            }

            string? razorpayOrderId = null;

            // Only create a Razorpay subscription if it doesn't already exist and the plan is not 'Starter'
            if (tenantSubscription.Status == SubscriptionStatusTypesEnum.Initiated &&
                subscriptionPlan.Type != SubscriptionPlanTypeEnum.Starter)
            {
                if (!tenantSubscriptionPurchaseDto.IsRecurringPayment)
                {
                    // Fetch the tenant details from the database using the Tenant ID
                    var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstAsync();

                    // Determine if tax should be included based on the tenant's country (India gets tax included)
                    bool includeTax = tenant.Country == CountriesEnum.India;

                    // Calculate the amount for the subscription, including tax if applicable
                    var amount = includeTax ? subscriptionPlan.Price * 1.18m : subscriptionPlan.Price;

                    // Log the calculated amount for reference
                    _logger.LogInformation("Calculated subscription amount for Tenant {TenantId}: {Amount} (IncludeTax: {IncludeTax})",
                                           tenant.Id, amount, includeTax);

                    // Create a new Top-up order (non-recurring payment) using the top-up service
                    var subscriptionOrder = await _topUpService.CreateTopUpAsync(new RazorpayOrderRequestDto()
                    {
                        Amount = amount,
                        Currency = subscriptionPlan.Currency,
                        Credits = 0,
                        IncludeTax = includeTax,
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

                if (string.IsNullOrEmpty(tenantSubscription.RazorpaySubscriptionId) && tenantSubscriptionPurchaseDto.IsRecurringPayment)
                {
                    // Attempt to create or update a Razorpay subscription
                    var razorpaySubscriptionResult = await CreateOrUpdateRazorpaySubscriptionAsync(
                        tenantSubscription,
                        subscriptionPlan,
                        tenantSubscriptionPurchaseDto
                    );

                    // Assign the newly generated subscription ID and payment URL if the creation succeeded
                    if (razorpaySubscriptionResult?.Data != null || razorpaySubscriptionResult.StatusCode == 200)
                    {
                        tenantSubscription.RazorpaySubscriptionId = razorpaySubscriptionResult.Data.Id;
                    }
                    else
                    {
                        _logger.LogWarning("Failed to create Razorpay subscription for tenant {TenantId}. Reason: {Message}",
                            tenantSubscription.TenantId, razorpaySubscriptionResult?.Message ?? "Unknown error");
                        serviceResponse.Message = razorpaySubscriptionResult.Message;
                        return serviceResponse;
                    }
                }

                tenantSubscription.IsRecurringPayment = tenantSubscriptionPurchaseDto.IsRecurringPayment;
                tenantSubscription.LastModifiedByUserId = _userId;
                tenantSubscription.NextBillingDate = DateTimeOffset.UtcNow.Date;

                // Update the new subscription into the repository
                _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

                // Save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to persist new tenant subscription for PlanId: {PlanId}", tenantSubscriptionPurchaseDto.PlanId);
                    return serviceResponse;
                }
            }

            // If the subscription plan is not 'Starter', billing details are required
            if (subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter)
            {
                // Create and assign initial credits for the tenant based on the subscription
                var tenantCredit = new TenantCredit()
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
                await _unitOfWork.TenantCreditRepo.InsertAsync(tenantCredit);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Unable to persist tenant credit. TenantId: {TenantId}, TenantCreditId: {TenantCreditId}", _tenantId, tenantCredit.Id);
                    return serviceResponse;
                }

                _logger.LogInformation("Tenant credit successfully saved. TenantId: {TenantId}, TenantCreditId: {TenantCreditId}", _tenantId, tenantCredit.Id);
            }
            else
            {
                // If the subscription plan is not 'Starter', check and update existing tenant credits
                var tenantCredits = await _unitOfWork.TenantCreditRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == _tenantId &&
                        w.ExpiredOn.Date >= DateTimeOffset.UtcNow.Date
                    )
                    .ToListAsync();
                if (tenantCredits.Any())
                {
                    foreach (var tenantCredit in tenantCredits)
                    {
                        tenantCredit.ExpiredOn = DateTimeOffset.UtcNow.AddDays(-1).Date;
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

            // Log the successful creation of the tenant subscription
            _logger.LogInformation("Tenant subscription successfully created with ID: {TenantSubscriptionId}", tenantSubscription.Id);


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
                _logger.LogInformation("Billing details successfully updated for TenantId: {TenantId}, BillingDetailId: {BillingDetailId}", _tenantId, existingBillingDetail.Id);
            }
            else
            {
                // Set audit fields for the new billing detail
                billingDetail.CreatedByUserId = _userId;
                billingDetail.LastModifiedByUserId = _userId;

                // Insert the new billing detail into the repository
                await _unitOfWork.BillingDetailRepo.InsertAsync(billingDetail);
                _logger.LogInformation("Billing details successfully created for TenantId: {TenantId}, BillingDetailId: {BillingDetailId}", _tenantId, billingDetail.Id);
            }

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Unable to persist billing details. TenantId: {TenantId}, BillingDetailId: {BillingDetailId}", _tenantId, billingDetail.Id);
                return serviceResponse;
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
            // Log any unexpected errors that occur during the subscription creation process
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
            _logger.LogInformation("Fetching current tenant subscription plan for tenant ID: {TenantId}", _tenantId);

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
                    (
                        (w.AvailableCredits > 0) ||
                        (w.AvailableCredits < 0 && w.ExpiredOn.Date < DateTimeOffset.UtcNow.Date) ||
                        (w.AvailableCredits < 0 && w.ExpiredOn >= DateTimeOffset.UtcNow.Date)
                    )
                )
                .SumAsync(sm => sm.AvailableCredits);

            // Fetch the latest billing details for the current tenant
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // Extract the current subscription plan for easier reference
            var currentPlan = tenantSubscription.Plan;

            if (currentPlan != null)
            {
                // Populate the subscription plan details for the dashboard
                subscriptionDashboardDto.CurrentPlan = new CurrentSubscriptionPlanDto()
                {
                    PlanId = currentPlan.Id,
                    PlanName = currentPlan.Name,
                    Frequency = tenantSubscription.Frequency,
                    Price = currentPlan.Price,
                    Currency = currentPlan.Currency,
                    AvailableCredits = availableCredits,
                    ExpiredOn = tenantSubscription.NextBillingDate,
                    IsActive = tenantSubscription.NextBillingDate > DateTimeOffset.UtcNow.Date,
                    IsRecurringPayment = tenantSubscription.IsRecurringPayment,
                    RazorpaySubscriptionId = tenantSubscription?.RazorpaySubscriptionId,
                    Feature = new CurrentSubscriptionPlanDetailDto()
                    {
                        StorageLimitMB = currentPlan.StorageLimitMB,
                        MaxSpaces = currentPlan.MaxSpaces,
                        MaxUsers = currentPlan.MaxUsers,
                        MaxCredits = currentPlan.MaxCredits,
                        HistoryRetentionDays = currentPlan.HistoryRetentionDays,
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
                            Limit = currentPlan.MaxSpaces,
                            Unit = "number"
                        },
                        new ResourceUsageDto()
                        {
                            ResourceName = "Storage",
                            Used = 0,
                            Limit = currentPlan.StorageLimitMB,
                            Unit = "MB"
                        }
                    },
                };
            }

            // Calculate the subscription fee based on the plan's frequency
            var subscriptionFee = currentPlan.Price;

            // Calculate the tax (18% of the subscription fee)
            var tax = subscriptionFee * 0.18m;  // 'm' denotes decimal literal

            // Calculate the total amount (subscription fee + tax)
            var totalAmount = subscriptionFee + tax;
            // Check if the NextBillingDate is not set (i.e., it's null)
            if (tenantSubscription?.NextBillingDate == null)
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
                DueDate = tenantSubscription.NextBillingDate,
                SubscriptionFee = subscriptionFee,
                Tax = tax,
                TotalAmount = totalAmount,
            };

            // Log success message after retrieving the subscription details successfully
            _logger.LogInformation("Successfully retrieved the current tenant subscription plan for tenant ID: {TenantId}", _tenantId);

            // Populate the service response with the subscription data and a success message
            serviceResponse.Data = subscriptionDashboardDto;
            serviceResponse.StatusCode = 200; // HTTP OK
            serviceResponse.Message = "Current tenant subscription plan retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the error in case of an exception
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
            _logger.LogInformation("Processing subscription upgrade for TenantId: {TenantId}, PlanId: {PlanId}", _tenantId, tenantSubscriptionPurchaseDto.PlanId);

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
                if (!tenantSubscriptionPurchaseDto.IsRecurringPayment)
                {
                    // Fetch the tenant details from the database using the Tenant ID
                    var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstAsync();

                    // Determine if tax should be included based on the tenant's country (India gets tax included)
                    bool includeTax = tenant.Country == CountriesEnum.India;

                    // Calculate the amount for the subscription, including tax if applicable
                    var amount = includeTax ? subscriptionPlan.Price * 1.18m : subscriptionPlan.Price;

                    // Log the calculated amount for reference
                    _logger.LogInformation("Calculated subscription amount for Tenant {TenantId}: {Amount} (IncludeTax: {IncludeTax})",
                                           tenant.Id, amount, includeTax);

                    // Create a new Top-up order (non-recurring payment) using the top-up service
                    var subscriptionOrder = await _topUpService.CreateTopUpAsync(new RazorpayOrderRequestDto()
                    {
                        Amount = amount,
                        Currency = subscriptionPlan.Currency,
                        Credits = 0,
                        IncludeTax = includeTax,
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

                if (!string.IsNullOrEmpty(subscriptionPlan.RazorpayPlanId) && tenantSubscriptionPurchaseDto.IsRecurringPayment)
                {
                    // Attempt to create or update a Razorpay subscription
                    var razorpaySubscriptionResult = await CreateOrUpdateRazorpaySubscriptionAsync(
                        tenantSubscription,
                        subscriptionPlan,
                        tenantSubscriptionPurchaseDto
                    );

                    // Assign the newly generated subscription ID and payment URL if the creation succeeded
                    if (razorpaySubscriptionResult?.Data != null || razorpaySubscriptionResult.StatusCode == 200)
                    {
                        tenantSubscription.RazorpaySubscriptionId = razorpaySubscriptionResult.Data.Id;
                    }
                    else
                    {
                        _logger.LogWarning("Failed to update Razorpay subscription for tenant {TenantId}. Reason: {Message}",
                            tenantSubscription.TenantId, razorpaySubscriptionResult?.Message ?? "Unknown error");
                        serviceResponse.Message = razorpaySubscriptionResult.Message;
                        return serviceResponse;
                    }
                }
            }
            else
            {
                if (!string.IsNullOrEmpty(tenantSubscription.RazorpaySubscriptionId))
                {

                    // Attempt to cancel the existing Razorpay subscription if it exists
                    var cancelSubscriptionResult = await CancelExistingPlanAsync(tenantSubscription);

                    // Check if the cancellation was successful
                    if (cancelSubscriptionResult.Data != null || cancelSubscriptionResult.StatusCode == 200)
                    {
                        _logger.LogInformation("Successfully cancelled the Razorpay subscription for TenantSubscriptionId: {TenantSubscriptionId}",
                            tenantSubscription.Id);

                        // Clear the Razorpay subscription ID after cancellation
                        tenantSubscription.RazorpaySubscriptionId = null;
                        tenantSubscription.IsRecurringPayment = false;
                    }
                    else
                    {
                        // Log failure if cancellation did not succeed
                        _logger.LogWarning("Failed to cancel Razorpay subscription for TenantSubscriptionId: {TenantSubscriptionId}. Reason: {Message}",
                            tenantSubscription.Id, cancelSubscriptionResult?.Message ?? "Unknown error");

                        // Set failure message for the response
                        serviceResponse.Message = cancelSubscriptionResult.Message;
                        return serviceResponse;
                    }
                }
            }

            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to update tenant subscription. TenantId: {TenantId}, PlanId: {PlanId}", _tenantId, tenantSubscriptionPurchaseDto.PlanId);
                return serviceResponse;
            }

            _logger.LogInformation("New tenant subscription created. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, tenantSubscription.Id);

            // If the plan is 'Starter', store credit details
            if (subscriptionPlan.Type == SubscriptionPlanTypeEnum.Starter)
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

                _logger.LogInformation("Tenant credit successfully saved. TenantId: {TenantId}, TenantCreditId: {TenantCreditId}", _tenantId, tenantCredit.Id);
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
            // Log the start of the cancellation process for tracking purposes
            _logger.LogInformation("Processing subscription cancellation for TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);

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

            // Cancel the associated Razorpay subscription if it exists
            if (!string.IsNullOrEmpty(tenantSubscription.RazorpaySubscriptionId))
            {
                // Call external service to cancel the Razorpay subscription
                var cancelSubscriptionResult = await CancelExistingPlanAsync(tenantSubscription);

                // Check if the Razorpay cancellation was successful
                if (cancelSubscriptionResult.Data != null || cancelSubscriptionResult.StatusCode == 200)
                {
                    _logger.LogInformation("Successfully cancelled Razorpay subscription for TenantSubscriptionId: {TenantSubscriptionId}",
                        tenantSubscription.Id);

                    // Clear the Razorpay subscription ID after cancellation
                    tenantSubscription.RazorpaySubscriptionId = null;
                    tenantSubscription.IsRecurringPayment = false;
                    tenantSubscription.Status = SubscriptionStatusTypesEnum.Cancelled;
                }
                else
                {
                    // Log failure if Razorpay cancellation did not succeed
                    _logger.LogWarning("Failed to cancel Razorpay subscription for TenantSubscriptionId: {TenantSubscriptionId}. Reason: {Message}",
                        tenantSubscription.Id, cancelSubscriptionResult?.Message ?? "Unknown error");

                    // Set failure message for the response
                    serviceResponse.Message = cancelSubscriptionResult.Message;
                    return serviceResponse;
                }
            }

            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to deactivate tenant subscription. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                return serviceResponse;
            }

            // Log success for deactivating the subscription
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
            // Log any unexpected exceptions that occur during the cancellation process
            _logger.LogError(ex, "An error occurred while cancelling the subscription. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
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
            // Log the start of the recurring payment cancellation process
            _logger.LogInformation("Processing recurring payment cancellation for TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);

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

            // Check if the recurring payment is associated with Razorpay or another payment system
            if (!string.IsNullOrEmpty(tenantSubscription.RazorpaySubscriptionId))
            {
                // Call external service to cancel the Razorpay subscription for recurring payments
                var cancelPaymentResult = await _subscriptionService.CancelSubscriptionAsync(tenantSubscription.RazorpaySubscriptionId, SubscriptionActionTimingEnum.CycleEnd);

                // If the cancellation was successful in Razorpay
                if (cancelPaymentResult.Data != null || cancelPaymentResult.StatusCode == 200)
                {
                    _logger.LogInformation("Successfully canceled recurring payment for Razorpay subscription associated with TenantSubscriptionId: {TenantSubscriptionId}",
                        tenantSubscription.Id);

                    // Set status to reflect cancellation of the recurring payment (but not the subscription itself)
                    tenantSubscription.IsRecurringPayment = false;
                }
                else
                {
                    // Log failure if Razorpay cancellation did not succeed
                    _logger.LogWarning("Failed to cancel recurring payment for Razorpay subscription associated with TenantSubscriptionId: {TenantSubscriptionId}. Reason: {Message}",
                        tenantSubscription.Id, cancelPaymentResult?.Message ?? "Unknown error");

                    // Set failure message for the response
                    serviceResponse.Message = cancelPaymentResult.Message;
                    return serviceResponse;
                }
            }

            // Update the tenant subscription with the new status
            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to update tenant subscription after canceling recurring payment. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
                return serviceResponse;
            }

            // Log success for canceling the recurring payment
            _logger.LogInformation("Recurring payment canceled successfully for TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);

            // Map the tenant subscription entity to a DTO for response (so client gets details of canceled payment)
            var tenantSubscriptionDto = tenantSubscription.Adapt<TenantSubscriptionDto>();

            // Set the service response with the DTO and success metadata
            serviceResponse.Data = tenantSubscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Recurring payment canceled successfully.";
        }
        catch (Exception ex)
        {
            // Log any unexpected exceptions that occur during the recurring payment cancellation process
            _logger.LogError(ex, "An error occurred while canceling the recurring payment. TenantId: {TenantId}, SubscriptionId: {SubscriptionId}", _tenantId, subscriptionUpdateRequestDto.SubscriptionId);
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }

    // Creates a new Razorpay subscription for the tenant if one does not already exist, or updates the existing subscription, and returns the subscription service response.
    private async Task<ServiceResponse<SubscriptionResponseDto>> CreateOrUpdateRazorpaySubscriptionAsync(
        TenantSubscription tenantSubscription,
        SubscriptionPlan subscriptionPlan,
        TenantSubscriptionPurchaseDto tenantSubscriptionPurchaseDto)
    {
        // Initialize default failure response in case something goes wrong
        var serviceResponse = new ServiceResponse<SubscriptionResponseDto>()
        {
            Data = null,
            Message = "Failed to create subscription. Please try again."
        };

        // Default billing cycle count set to 1 for one-time (non-recurring) payments
        int totalCount = 1;

        // If this is a recurring payment, calculate total billing cycles based on plan frequency
        if (tenantSubscriptionPurchaseDto.IsRecurringPayment)
        {
            totalCount = subscriptionPlan.Frequency == SubscriptionFrequenciesEnum.Monthly ? 36 : 5;
            _logger.LogInformation("Recurring payment detected. Setting total billing cycles to {TotalCount} for plan frequency {Frequency}.",
                totalCount, subscriptionPlan.Frequency);
        }

        try
        {
            // Fetch tenant details from database to get existing Razorpay customer info
            var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstOrDefaultAsync();

            // If tenant not found, log error and return failure response immediately
            if (tenant == null)
            {
                _logger.LogError("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Check if tenant already has an associated Razorpay subscription
            if (string.IsNullOrEmpty(tenantSubscription.RazorpaySubscriptionId))
            {
                // No existing subscription - start subscription creation process
                _logger.LogInformation("No existing Razorpay subscription found for TenantId: {TenantId}. Creating new subscription.", tenant.Id);

                // If tenant lacks a Razorpay customer ID, create a new Razorpay customer first
                if (string.IsNullOrEmpty(tenant.RazorpayCustomerId))
                {
                    // Retrieve current user info from database to populate Razorpay customer details
                    var currentUser = await _unitOfWork.AccountUserRepo.GetByConditionAsync(w => w.Id == _userId).FirstOrDefaultAsync();

                    // If user not found, log and return failure response
                    if (currentUser == null)
                    {
                        _logger.LogError("User not found with ID: {UserId}", _userId);
                        serviceResponse.Message = "User not found.";
                        return serviceResponse;
                    }

                    // Create customer request DTO to send to Razorpay API
                    var customerRequest = new CustomerRequestDto
                    {
                        Name = $"{currentUser.FirstName} {currentUser.LastName}",
                        Email = currentUser.Email,
                        Contact = currentUser.PhoneNumber,
                        GstNumber = "" // TODO: Add GST number if available
                    };

                    // Call Razorpay API to create new customer
                    var customerResponse = await _customerService.CreateCustomerAsync(customerRequest);

                    // If Razorpay customer creation failed, log and return failure response
                    if (customerResponse.Data == null || customerResponse.StatusCode != 200)
                    {
                        _logger.LogError("Failed to create Razorpay customer for UserId: {UserId}. Message: {Message}",
                            _userId, customerResponse.Message);
                        serviceResponse.Message = "Failed to create Razorpay customer.";
                        return serviceResponse;
                    }

                    // Assign the new Razorpay customer ID to the tenant entity
                    tenant.RazorpayCustomerId = customerResponse.Data.Id;
                    tenant.LastModifiedByUserId = _userId;

                    // Mark tenant entity as modified for database update
                    _unitOfWork.TenantRepo.Update(tenant);

                    // Save changes to database; if it fails, log error and return failure response
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to update tenant with new RazorpayCustomerId: {CustomerId} for TenantId: {TenantId}",
                            tenant.RazorpayCustomerId, tenant.Id);
                        serviceResponse.Message = "Failed to update tenant with Razorpay customer ID.";
                        return serviceResponse;
                    }

                    _logger.LogInformation("Assigned RazorpayCustomerId '{CustomerId}' to TenantId: {TenantId}",
                        tenant.RazorpayCustomerId, tenant.Id);
                }
            }
            else
            {
                // Existing subscription found, proceed with update flow
                _logger.LogInformation("Existing Razorpay subscription found (ID: {SubscriptionId}) for TenantId: {TenantId}. Updating subscription.",
                    tenantSubscription.RazorpaySubscriptionId, tenant.Id);

                // Call Razorpay API to update the subscription
                var updateResponse = await _subscriptionService.CancelSubscriptionAsync(tenantSubscription.RazorpaySubscriptionId, SubscriptionActionTimingEnum.Now);

                // Log success or failure of subscription update attempt
                if (updateResponse.Data != null && updateResponse.StatusCode == 200)
                {
                    _logger.LogInformation("Successfully updated Razorpay subscription with ID: {SubscriptionId} for TenantId: {TenantId}",
                        updateResponse.Data.Id, tenant.Id);
                }
                else
                {
                    _logger.LogError("Failed to update Razorpay subscription with ID: {SubscriptionId}. Message: {Message}",
                        tenantSubscription.RazorpaySubscriptionId, updateResponse.Message);
                }
            }
            // Prepare the subscription creation request with appropriate details
            var createRequest = new SubscriptionRequestDto
            {
                PlanId = subscriptionPlan.RazorpayPlanId,
                Quantity = 1,
                CustomerId = tenant.RazorpayCustomerId,
                TotalCount = totalCount,
                CustomerNotify = tenantSubscriptionPurchaseDto.IsNotifyCustomer
            };

            // Call Razorpay API to create the subscription
            var createResponse = await _subscriptionService.CreateSubscriptionAsync(createRequest);

            // Log success or failure of subscription creation attempt
            if (createResponse.Data != null && createResponse.StatusCode == 200)
            {
                _logger.LogInformation("Successfully created Razorpay subscription with ID: {SubscriptionId} for TenantId: {TenantId}",
                    createResponse.Data.Id, tenant.Id);
                serviceResponse.Data = createResponse.Data;
            }
            else
            {
                _logger.LogError("Failed to create Razorpay subscription for TenantId: {TenantId}. Message: {Message}",
                    tenant.Id, createResponse.Message);
            }

        }
        catch (Exception ex)
        {
            // Log unexpected exceptions with full details for debugging
            _logger.LogError(ex, "An exception occurred while creating or updating Razorpay subscription for TenantId: {TenantId}", _tenantId);
        }

        // Return default failure response if all else fails
        return serviceResponse;
    }

    // Cancels the existing Razorpay subscription for the given tenant subscription immediately.
    private async Task<ServiceResponse<SubscriptionResponseDto>> CancelExistingPlanAsync(TenantSubscription tenantSubscription)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<SubscriptionResponseDto>
        {
            Data = null,
            Message = "Failed to cancel the subscription. Please try again."
        };

        try
        {
            // Check if the tenant has a Razorpay subscription ID; if not, log a warning and return early
            if (string.IsNullOrEmpty(tenantSubscription?.RazorpaySubscriptionId))
            {
                _logger.LogWarning("No Razorpay subscription ID found for the tenant. Cancellation skipped.");
                serviceResponse.Message = "No active subscription found to cancel.";
                return serviceResponse;
            }

            // Log the attempt to cancel the subscription, including the subscription ID and tenant ID
            _logger.LogInformation("Attempting to cancel Razorpay subscription with ID: {SubscriptionId} for TenantSubscriptionId: {TenantSubscriptionId}",
                tenantSubscription.RazorpaySubscriptionId, tenantSubscription.Id);

            // Attempt to cancel the subscription by calling the Razorpay service with the subscription ID
            var cancelResponse = await _subscriptionService.CancelSubscriptionAsync(
                tenantSubscription.RazorpaySubscriptionId,
                SubscriptionActionTimingEnum.Now);

            // Check if the cancellation request was successful
            if (cancelResponse.Data != null && cancelResponse.StatusCode == 200)
            {
                // If the cancellation was successful, log the success and update the response message
                _logger.LogInformation("Successfully cancelled Razorpay subscription with ID: {SubscriptionId}", tenantSubscription.RazorpaySubscriptionId);
                cancelResponse.Message = "Subscription cancelled successfully.";
                return cancelResponse;
            }
            else
            {
                // If cancellation failed, log the error with the failure message from the Razorpay service
                _logger.LogError("Failed to cancel Razorpay subscription with ID: {SubscriptionId}. Message: {Message}",
                    tenantSubscription.RazorpaySubscriptionId, cancelResponse.Message);
                return cancelResponse;
            }
        }
        catch (Exception ex)
        {
            // Log any unexpected errors or exceptions that occur during the cancellation process
            _logger.LogError(ex, "An exception occurred while cancelling Razorpay subscription with ID: {SubscriptionId}",
                tenantSubscription?.RazorpaySubscriptionId);
        }

        // Return the default failure response if any exception or unexpected error occurred
        return serviceResponse;
    }
}