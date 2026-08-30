namespace AccountsAPIs.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly Razorpay.Api.RazorpayClient _razorpayClient;
    private readonly ILogger<SubscriptionService> _logger;

    public SubscriptionService(Razorpay.Api.RazorpayClient razorpayClient, ILogger<SubscriptionService> logger)
    {
        _razorpayClient = razorpayClient;
        _logger = logger;
    }

    // Creates a new subscription using the provided subscription details.
    public async Task<ServiceResponse<SubscriptionResponseDto>> CreateSubscriptionAsync(SubscriptionRequestDto subscriptionRequestDto)
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<SubscriptionResponseDto>
        {
            Data = null,
            Message = "Failed to create subscription. Please try again."
        };

        try
        {
            // Input validation check: PlanId, Quantity, and TotalCount are required
            if (string.IsNullOrEmpty(subscriptionRequestDto.PlanId) || subscriptionRequestDto.Quantity <= 0 || subscriptionRequestDto.TotalCount <= 0)
            {
                _logger.LogWarning("Invalid subscription data: PlanId, Quantity or TotalCount is invalid.");
                serviceResponse.Message = "Invalid subscription data. PlanId, Quantity, and TotalCount are required.";
                return serviceResponse;
            }

            // Prepare the subscription request
            var subscriptionRequest = new Dictionary<string, object>
            {
                { "plan_id", subscriptionRequestDto.PlanId },
                { "total_count", subscriptionRequestDto.TotalCount },
                { "customer_notify", subscriptionRequestDto.CustomerNotify },
            };

            // Check if the quantity is greater than 1 before adding to the subscription request.
            if (subscriptionRequestDto.Quantity > 1)
            {
                subscriptionRequest.Add("quantity", subscriptionRequestDto.Quantity);
            }

            // Check if a customer ID is provided (i.e., not null or empty).
            if (!string.IsNullOrEmpty(subscriptionRequestDto.CustomerId))
            {
                subscriptionRequest.Add("customer_id", subscriptionRequestDto.CustomerId);
            }

            // Call Razorpay API to create the subscription
            var subscription = await Task.Run(() => _razorpayClient.Subscription.Create(subscriptionRequest));


            // Map Razorpay response to DTO
            var createdSubscription = new SubscriptionResponseDto
            {
                Id = subscription["id"].ToString(),
                PlanId = subscription["plan_id"].ToString(),
                Status = subscription["status"].ToString(),
                CurrentStart = subscription["current_start"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["current_start"])) : null,
                CurrentEnd = subscription["current_end"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["current_end"])) : null,
                ShortUrl = subscription["short_url"]?.ToString(),
                ChangeScheduledAt = subscription["change_scheduled_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["change_scheduled_at"])) : null,
                CustomerNotify = subscription["customer_notify"] != null && Convert.ToInt32(subscription["customer_notify"]) == 1,
                HasScheduledChanges = subscription["has_scheduled_changes"] != null && Convert.ToInt32(subscription["has_scheduled_changes"]) == 1,
                ChargeAt = subscription["charge_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["charge_at"])) : null,
                EndAt = subscription["end_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["end_at"])) : null,
                EndedAt = subscription["ended_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["ended_at"])) : null,
                PaymentMethod = subscription["payment_method"]?.ToString(),
                RemainingCount = Convert.ToInt32(subscription["remaining_count"]),
                TotalCount = Convert.ToInt32(subscription["total_count"]),
                PaidCount = Convert.ToInt32(subscription["paid_count"]),
                Quantity = Convert.ToInt32(subscription["quantity"]),
                CustomerId = subscription["customer_id"]?.ToString(),
                StartAt = subscription["start_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["start_at"])) : null,
                ExpireBy = subscription["expire_by"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["expire_by"])) : null,
                CreatedAt = subscription["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["created_at"])) : null
            };

            // Set success response
            serviceResponse.Data = createdSubscription;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating subscription with PlanId: {PlanId}, Quantity: {Quantity}, TotalCount: {TotalCount}",
                subscriptionRequestDto.PlanId, subscriptionRequestDto.Quantity, subscriptionRequestDto.TotalCount);
        }

        return serviceResponse;
    }

    // Retrieves a subscription by its ID from Razorpay.
    public async Task<ServiceResponse<SubscriptionResponseDto>> GetSubscriptionByIdAsync(string subscriptionId)
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<SubscriptionResponseDto>
        {
            Data = null,
            Message = "Failed to retrieve subscription. Please try again."
        };

        try
        {

            // Call Razorpay API to fetch the subscription by ID
            var subscription = await Task.Run(() => _razorpayClient.Subscription.Fetch(subscriptionId));


            // Map Razorpay response to DTO
            var retrievedSubscription = new SubscriptionResponseDto
            {
                Id = subscription["id"].ToString(),
                PlanId = subscription["plan_id"].ToString(),
                Status = subscription["status"].ToString(),
                CurrentStart = subscription["current_start"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["current_start"])) : null,
                CurrentEnd = subscription["current_end"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["current_end"])) : null,
                ShortUrl = subscription["short_url"]?.ToString(),
                ChangeScheduledAt = subscription["change_scheduled_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["change_scheduled_at"])) : null,
                CustomerNotify = subscription["customer_notify"] != null && Convert.ToInt32(subscription["customer_notify"]) == 1,
                HasScheduledChanges = subscription["has_scheduled_changes"] != null && Convert.ToInt32(subscription["has_scheduled_changes"]) == 1,
                ChargeAt = subscription["charge_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["charge_at"])) : null,
                EndAt = subscription["end_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["end_at"])) : null,
                EndedAt = subscription["ended_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["ended_at"])) : null,
                PaymentMethod = subscription["payment_method"]?.ToString(),
                RemainingCount = Convert.ToInt32(subscription["remaining_count"]),
                TotalCount = Convert.ToInt32(subscription["total_count"]),
                PaidCount = Convert.ToInt32(subscription["paid_count"]),
                Quantity = Convert.ToInt32(subscription["quantity"]),
                CustomerId = subscription["customer_id"]?.ToString(),
                StartAt = subscription["start_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["start_at"])) : null,
                ExpireBy = subscription["expire_by"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["expire_by"])) : null,
                CreatedAt = subscription["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(subscription["created_at"])) : null
            };

            // Set success response
            serviceResponse.Data = retrievedSubscription;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching subscription with ID: {SubscriptionId}", subscriptionId);
        }

        return serviceResponse;
    }

    // Updates an existing subscription with new details.
    public async Task<ServiceResponse<SubscriptionResponseDto>> UpdateSubscriptionAsync(string subscriptionId, UpdateSubscriptionRequestDto request)
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<SubscriptionResponseDto>
        {
            Data = null,
            Message = "Failed to update subscription. Please try again."
        };

        try
        {
            // Prepare the update request dictionary
            var updateRequest = new Dictionary<string, object>();

            // Check if a new PlanId is provided (not null or empty)
            if (!string.IsNullOrEmpty(request.PlanId))
            {
                // Add the new plan_id to the update request
                updateRequest.Add("plan_id", request.PlanId);
            }

            // Check if the quantity is greater than 1 before adding to the update request
            if (request.Quantity > 1)
            {
                updateRequest.Add("quantity", request.Quantity);
            }

            // Check if a new RemainingCount is provided
            if (request.RemainingCount.HasValue)
            {
                updateRequest.Add("remaining_count", request.RemainingCount.Value);
            }

            // CustomerNotify is mandatory for updates
            updateRequest.Add("customer_notify", request.CustomerNotify);

            // Call Razorpay API to update the subscription
            var updatedSubscription = await Task.Run(() =>
            {
                var subscription = _razorpayClient.Subscription.Fetch(subscriptionId);
                return subscription.Edit(updateRequest);
            });

            // Map Razorpay response to DTO
            var updatedSubscriptionDto = new SubscriptionResponseDto
            {
                Id = updatedSubscription["id"].ToString(),
                PlanId = updatedSubscription["plan_id"].ToString(),
                Status = updatedSubscription["status"].ToString(),
                Quantity = Convert.ToInt32(updatedSubscription["quantity"]),
                RemainingCount = Convert.ToInt32(updatedSubscription["remaining_count"]),
                CustomerNotify = Convert.ToInt32(updatedSubscription["customer_notify"]) == 1
            };

            // Set success response
            serviceResponse.Data = updatedSubscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating subscription with ID: {SubscriptionId}", subscriptionId);
        }

        return serviceResponse;
    }

    // Retrieves all subscriptions.
    public async Task<ServiceResponse<List<SubscriptionResponseDto>>> GetAllSubscriptionsAsync()
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<List<SubscriptionResponseDto>>
        {
            Data = null,
            Message = "Failed to retrieve subscriptions. Please try again."
        };

        try
        {

            // Call Razorpay API to fetch all subscriptions
            var subscriptionList = await Task.Run(() => _razorpayClient.Subscription.All());

            // Map Razorpay response to SubscriptionResponseDto
            var subscriptions = subscriptionList.Select(s => new SubscriptionResponseDto()
            {
                Id = s["id"].ToString(),
                PlanId = s["plan_id"].ToString(),
                Status = s["status"].ToString(),
                CurrentStart = s["current_start"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["current_start"])) : null,
                CurrentEnd = s["current_end"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["current_end"])) : null,
                ShortUrl = s["short_url"]?.ToString(),
                ChangeScheduledAt = s["change_scheduled_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["change_scheduled_at"])) : null,
                CustomerNotify = s["customer_notify"] != null && Convert.ToInt32(s["customer_notify"]) == 1,
                HasScheduledChanges = s["has_scheduled_changes"] != null && Convert.ToInt32(s["has_scheduled_changes"]) == 1,
                ChargeAt = s["charge_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["charge_at"])) : null,
                EndAt = s["end_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["end_at"])) : null,
                EndedAt = s["ended_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["ended_at"])) : null,
                PaymentMethod = s["payment_method"]?.ToString(),
                RemainingCount = Convert.ToInt32(s["remaining_count"]),
                TotalCount = Convert.ToInt32(s["total_count"]),
                PaidCount = Convert.ToInt32(s["paid_count"]),
                Quantity = Convert.ToInt32(s["quantity"]),
                CustomerId = s["customer_id"]?.ToString(),
                StartAt = s["start_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["start_at"])) : null,
                ExpireBy = s["expire_by"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["expire_by"])) : null,
                CreatedAt = s["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(s["created_at"])) : null
            }).ToList();


            // Set success response
            serviceResponse.Data = subscriptions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscriptions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching all subscriptions.");
        }

        return serviceResponse;
    }

    // Cancels a subscription.
    public async Task<ServiceResponse<SubscriptionResponseDto>> CancelSubscriptionAsync(string subscriptionId, SubscriptionActionTimingEnum subscriptionActionTiming)
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<SubscriptionResponseDto>
        {
            Data = null,
            Message = "Failed to cancel subscription. Please try again."
        };

        try
        {
            _logger.LogInformation("Canceling subscription with ID: {SubscriptionId}, CancelAtCycleEnd: {CancelAtCycleEnd}",
                subscriptionId, subscriptionActionTiming == SubscriptionActionTimingEnum.CycleEnd);

            // Prepare options for cancellation: whether to cancel at the cycle end
            var options = new Dictionary<string, object>
                {
                    { "cancel_at_cycle_end", subscriptionActionTiming == SubscriptionActionTimingEnum.CycleEnd }
                };

            // Fetch the subscription from Razorpay
            var subscription = _razorpayClient.Subscription.Fetch(subscriptionId);

            // Call the Razorpay API to cancel the subscription
            var updatedSubscription = await Task.Run(() => subscription.Cancel(options));

            // Map Razorpay response to SubscriptionResponseDto
            var subscriptionDto = new SubscriptionResponseDto()
            {
                Id = updatedSubscription["id"].ToString(),
                PlanId = updatedSubscription["plan_id"].ToString(),
                Status = updatedSubscription["status"].ToString(),
                CurrentStart = updatedSubscription["current_start"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["current_start"])) : null,
                CurrentEnd = updatedSubscription["current_end"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["current_end"])) : null,
                ShortUrl = updatedSubscription["short_url"]?.ToString(),
                ChangeScheduledAt = updatedSubscription["change_scheduled_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["change_scheduled_at"])) : null,
                CustomerNotify = updatedSubscription["customer_notify"] != null && Convert.ToInt32(updatedSubscription["customer_notify"]) == 1,
                HasScheduledChanges = updatedSubscription["has_scheduled_changes"] != null && Convert.ToInt32(updatedSubscription["has_scheduled_changes"]) == 1,
                ChargeAt = updatedSubscription["charge_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["charge_at"])) : null,
                EndAt = updatedSubscription["end_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["end_at"])) : null,
                EndedAt = updatedSubscription["ended_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["ended_at"])) : null,
                PaymentMethod = updatedSubscription["payment_method"]?.ToString(),
                RemainingCount = Convert.ToInt32(updatedSubscription["remaining_count"]),
                TotalCount = Convert.ToInt32(updatedSubscription["total_count"]),
                PaidCount = Convert.ToInt32(updatedSubscription["paid_count"]),
                Quantity = Convert.ToInt32(updatedSubscription["quantity"]),
                CustomerId = updatedSubscription["customer_id"]?.ToString(),
                StartAt = updatedSubscription["start_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["start_at"])) : null,
                ExpireBy = updatedSubscription["expire_by"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["expire_by"])) : null,
                CreatedAt = updatedSubscription["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(updatedSubscription["created_at"])) : null
            };

            // Set success response
            serviceResponse.Data = subscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription canceled successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while canceling subscription with ID: {SubscriptionId}", subscriptionId);
        }

        return serviceResponse;
    }

    // Pauses a subscription.
    public async Task<ServiceResponse<SubscriptionResponseDto>> PauseSubscriptionAsync(string subscriptionId, SubscriptionActionTimingEnum subscriptionActionTiming)
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<SubscriptionResponseDto>
        {
            Data = null,
            Message = "Failed to pause subscription. Please try again."
        };

        try
        {
            _logger.LogInformation("Pausing subscription with ID: {SubscriptionId}, PauseAt: {PauseAt}",
                subscriptionId, subscriptionActionTiming.ToString());

            // Prepare options for pausing: determine whether to pause immediately or at the cycle end
            var options = new Dictionary<string, object>
                {
                    { "pause_at", subscriptionActionTiming == SubscriptionActionTimingEnum.Now ? "now" : "cycle_end" }
                };

            // Fetch the subscription details from Razorpay
            var subscription = _razorpayClient.Subscription.Fetch(subscriptionId);

            // Call Razorpay API to pause the subscription
            var pausedSubscription = await Task.Run(() => subscription.Pause(options));
            // Map Razorpay response to SubscriptionResponseDto
            var subscriptionDto = new SubscriptionResponseDto()
            {
                Id = pausedSubscription["id"].ToString(),
                PlanId = pausedSubscription["plan_id"].ToString(),
                Status = pausedSubscription["status"].ToString(),
                CurrentStart = pausedSubscription["current_start"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["current_start"])) : null,
                CurrentEnd = pausedSubscription["current_end"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["current_end"])) : null,
                ShortUrl = pausedSubscription["short_url"]?.ToString(),
                ChangeScheduledAt = pausedSubscription["change_scheduled_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["change_scheduled_at"])) : null,
                CustomerNotify = pausedSubscription["customer_notify"] != null && Convert.ToInt32(pausedSubscription["customer_notify"]) == 1,
                HasScheduledChanges = pausedSubscription["has_scheduled_changes"] != null && Convert.ToInt32(pausedSubscription["has_scheduled_changes"]) == 1,
                ChargeAt = pausedSubscription["charge_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["charge_at"])) : null,
                EndAt = pausedSubscription["end_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["end_at"])) : null,
                EndedAt = pausedSubscription["ended_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["ended_at"])) : null,
                PaymentMethod = pausedSubscription["payment_method"]?.ToString(),
                RemainingCount = Convert.ToInt32(pausedSubscription["remaining_count"]),
                TotalCount = Convert.ToInt32(pausedSubscription["total_count"]),
                PaidCount = Convert.ToInt32(pausedSubscription["paid_count"]),
                Quantity = Convert.ToInt32(pausedSubscription["quantity"]),
                CustomerId = pausedSubscription["customer_id"]?.ToString(),
                StartAt = pausedSubscription["start_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["start_at"])) : null,
                ExpireBy = pausedSubscription["expire_by"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["expire_by"])) : null,
                CreatedAt = pausedSubscription["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(pausedSubscription["created_at"])) : null
            };

            // Set success response
            serviceResponse.Data = subscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription paused successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while pausing subscription with ID: {SubscriptionId}", subscriptionId);
        }

        return serviceResponse;
    }

    // Resumes a subscription.
    public async Task<ServiceResponse<SubscriptionResponseDto>> ResumeSubscriptionAsync(string subscriptionId, SubscriptionActionTimingEnum subscriptionActionTiming)
    {
        // Create a response object with default failure message
        var serviceResponse = new ServiceResponse<SubscriptionResponseDto>
        {
            Data = null,
            Message = "Failed to resume subscription. Please try again."
        };

        try
        {
            _logger.LogInformation("Resuming subscription with ID: {SubscriptionId}, ResumeAt: {ResumeAt}",
                subscriptionId, subscriptionActionTiming.ToString());

            // Prepare options for resuming the subscription: either now or cycle end
            var options = new Dictionary<string, object>
                {
                    { "resume_at", subscriptionActionTiming == SubscriptionActionTimingEnum.Now ? "now" : "cycle_end" }
                };

            // Fetch subscription details from Razorpay
            var subscription = _razorpayClient.Subscription.Fetch(subscriptionId);

            // Call Razorpay API to resume the subscription
            var resumedSubscription = await Task.Run(() => subscription.Resume(options));
            // Map Razorpay response to SubscriptionResponseDto
            var subscriptionDto = new SubscriptionResponseDto()
            {
                Id = resumedSubscription["id"].ToString(),
                PlanId = resumedSubscription["plan_id"].ToString(),
                Status = resumedSubscription["status"].ToString(),
                CurrentStart = resumedSubscription["current_start"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["current_start"])) : null,
                CurrentEnd = resumedSubscription["current_end"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["current_end"])) : null,
                ShortUrl = resumedSubscription["short_url"]?.ToString(),
                ChangeScheduledAt = resumedSubscription["change_scheduled_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["change_scheduled_at"])) : null,
                CustomerNotify = resumedSubscription["customer_notify"] != null && Convert.ToInt32(resumedSubscription["customer_notify"]) == 1,
                HasScheduledChanges = resumedSubscription["has_scheduled_changes"] != null && Convert.ToInt32(resumedSubscription["has_scheduled_changes"]) == 1,
                ChargeAt = resumedSubscription["charge_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["charge_at"])) : null,
                EndAt = resumedSubscription["end_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["end_at"])) : null,
                EndedAt = resumedSubscription["ended_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["ended_at"])) : null,
                PaymentMethod = resumedSubscription["payment_method"]?.ToString(),
                RemainingCount = Convert.ToInt32(resumedSubscription["remaining_count"]),
                TotalCount = Convert.ToInt32(resumedSubscription["total_count"]),
                PaidCount = Convert.ToInt32(resumedSubscription["paid_count"]),
                Quantity = Convert.ToInt32(resumedSubscription["quantity"]),
                CustomerId = resumedSubscription["customer_id"]?.ToString(),
                StartAt = resumedSubscription["start_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["start_at"])) : null,
                ExpireBy = resumedSubscription["expire_by"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["expire_by"])) : null,
                CreatedAt = resumedSubscription["created_at"] != null ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(resumedSubscription["created_at"])) : null
            };

            // Set success response
            serviceResponse.Data = subscriptionDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription resumed successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while resuming subscription with ID: {SubscriptionId}", subscriptionId);
        }

        return serviceResponse;
    }
}