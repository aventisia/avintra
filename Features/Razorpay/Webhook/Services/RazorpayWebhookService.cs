using Newtonsoft.Json.Linq;

namespace AccountsAPIs.Services;
public class WebhookService : IWebhookService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WebhookService> _logger;
    private readonly RazorpayConfig _razorpayConfig;

    public WebhookService(IUnitOfWork unitOfWork, ILogger<WebhookService> logger, RazorpayConfig razorpayConfig)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _razorpayConfig = razorpayConfig;
    }

    public async Task<bool> HandleWebhookAsync(HttpRequest request)
    {
        // Log the receipt of the webhook request from Razorpay
        _logger.LogInformation("Received a Razorpay webhook request.");

        try
        {
            // Read the raw body from the incoming HTTP request
            string body;
            using (var reader = new StreamReader(request.Body, Encoding.UTF8))
            {
                body = await reader.ReadToEndAsync();
            }

            _logger.LogInformation("Webhook body successfully read.");

            // Retrieve the Razorpay signature from the headers
            string? signature = request.Headers["X-Razorpay-Signature"];
            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Missing X-Razorpay-Signature header.");
                return false;
            }

            // Fetch the webhook secret from configuration to validate the signature
            string secret = _razorpayConfig.WebhookSecret;

            // Verify the authenticity of the webhook request by comparing the Razorpay signature with a computed hash using the request body and secret.
            Razorpay.Api.Utils.verifyWebhookSignature(body, signature, secret);

            _logger.LogInformation("Razorpay signature verified successfully.");

            // Parse the JSON payload from the body
            var json = Newtonsoft.Json.Linq.JObject.Parse(body);

            // Extract the event type (e.g., payment.captured, order.paid, etc.)
            string eventType = json["event"]?.ToString()?.ToLower() ?? string.Empty;

            if (string.IsNullOrEmpty(eventType))
            {
                _logger.LogWarning("Event type missing in webhook payload.");
                return false;
            }

            _logger.LogInformation($"Event type '{eventType}' received.");

            // Pass the event to the appropriate handler for business logic processing
            await DispatchEventAsync(eventType, json);

            _logger.LogInformation($"Successfully processed Razorpay webhook event: {eventType}");

            return true;
        }
        catch (Exception ex)
        {
            // Log the error details for debugging and return failure
            _logger.LogError(ex, $"Razorpay webhook processing failed: {ex.Message}");
            return false;
        }
    }

    // Dispatches incoming events to their corresponding handler methods based on the event type.
    private async Task DispatchEventAsync(string eventType, Newtonsoft.Json.Linq.JObject json)
    {
        _logger.LogInformation($"Dispatching event '{eventType}' to the appropriate handler.");

        switch (eventType)
        {
            // ========================== Payment Events ==========================

            // case "payment.authorized":
            //     await HandlePaymentAuthorized(json); break;

            // case "payment.failed":
            //     await HandlePaymentFailed(json); break; 

            // case "payment.captured":
            //     await HandlePaymentCaptured(json); break; 
            // ========================== Order Events ==========================

            // case "order.paid":
            //     await HandleOrderPaid(json); break;
            // case "order.notification.delivered":
            //     await HandleOrderNotificationDelivered(json); break;

            // case "order.notification.failed":
            //     await HandleOrderNotificationFailed(json); break;

            // ========================== Invoice Events ==========================

            // case "invoice.paid":
            //     await HandleInvoicePaid(json); break;

            // case "invoice.partially_paid":
            //     await HandleInvoicePartiallyPaid(json); break;

            // case "invoice.expired":
            //     await HandleInvoiceExpired(json); break;  

            // ========================== Subscription Events ==========================

            case "subscription.authenticated":
                await HandleSubscriptionAuthenticated(json);
                break;

            case "subscription.paused":
                await HandleSubscriptionPaused(json);
                break;

            case "subscription.resumed":
                await HandleSubscriptionResumed(json);
                break;

            case "subscription.activated":
                await HandleSubscriptionActivated(json);
                break;

            case "subscription.pending":
                await HandleSubscriptionPending(json);
                break;

            case "subscription.halted":
                await HandleSubscriptionHalted(json);
                break;

            case "subscription.charged":
                await HandleSubscriptionCharged(json);
                break;

            case "subscription.cancelled":
                await HandleSubscriptionCancelled(json);
                break;

            case "subscription.completed":
                await HandleSubscriptionCompleted(json);
                break;

            case "subscription.updated":
                await HandleSubscriptionUpdated(json);
                break;

            // ========================== Dispute Events ==========================

            // case "payment.dispute.created":
            //     await HandlePaymentDisputeCreated(json); break;

            // case "payment.dispute.won":
            //     await HandlePaymentDisputeWon(json); break;

            // case "payment.dispute.lost":
            //     await HandlePaymentDisputeLost(json); break;

            // case "payment.dispute.closed":
            //     await HandlePaymentDisputeClosed(json); break;

            // case "payment.dispute.under_review":
            //     await HandlePaymentDisputeUnderReview(json); break;

            // case "payment.dispute.action_required":
            //     await HandlePaymentDisputeActionRequired(json); break;

            // ========================== Fund Account Validation Events ==========================

            // case "fund_account.validation.completed":
            //     await HandleFundAccountValidationCompleted(json); break;

            // case "fund_account.validation.failed":
            //     await HandleFundAccountValidationFailed(json); break;

            // ========================== Payment Downtime Events ==========================

            // case "payment.downtime.started":
            //     await HandlePaymentDowntimeStarted(json); break;

            // case "payment.downtime.updated":
            //     await HandlePaymentDowntimeUpdated(json); break;

            // case "payment.downtime.resolved":
            //     await HandlePaymentDowntimeResolved(json); break;

            // ========================== Refund Events ==========================

            // case "refund.speed_changed":
            //     await HandleRefundSpeedChanged(json); break;

            // case "refund.processed":
            //     await HandleRefundProcessed(json); break;

            // case "refund.failed":
            //     await HandleRefundFailed(json); break;

            // case "refund.created":
            //     await HandleRefundCreated(json); break;

            // ========================== Account Events ==========================

            // case "account.instantly_activated":
            //     await HandleAccountInstantlyActivated(json); break;

            // case "account.activated_kyc_pending":
            //     await HandleAccountActivatedKYCPending(json); break;

            // ========================== Payment Link Events ==========================

            // case "payment_link.paid":
            //     await HandlePaymentLinkPaid(json); break;

            // case "payment_link.partially_paid":
            //     await HandlePaymentLinkPartiallyPaid(json); break;

            // case "payment_link.expired":
            //     await HandlePaymentLinkExpired(json); break;

            // case "payment_link.cancelled":
            //     await HandlePaymentLinkCancelled(json); break;

            // ========================== Unhandled Events ==========================

            default:
                _logger.LogWarning($"Unhandled Razorpay event received: '{eventType}'");
                break;
        }
    }

    private async Task HandleSubscriptionUpdated(JObject json)
    {
        // Log the incoming request for subscription update event
        _logger.LogInformation("Handling subscription update event.");

        // Call the helper method to process the status update to 'Authenticated'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Authenticated);
    }

    private async Task HandleSubscriptionCharged(JObject json)
    {
        // Log the incoming request for subscription charge event
        _logger.LogInformation("Handling subscription charge event.");

        // Call the helper method to process the status update to 'Active'
        TenantSubscription? tenantSubscription = await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Active);

        // Process and persist billing-related details from the webhook
        await ProcessBillingDetail(json, tenantSubscription);

        // Assign credits based on subscription details
        await AssignCreditAsync(tenantSubscription);
    }

    private async Task AssignCreditAsync(TenantSubscription? tenantSubscription)
    {
        if (tenantSubscription == null)
        {
            _logger.LogError("Tenant subscription is null. Cannot assign credit.");
            return;
        }

        // Create the TenantCredit object with relevant details
        var tenantCredit = new TenantCredit()
        {
            SubscriptionId = tenantSubscription.Id,
            CreditedOn = DateTimeOffset.UtcNow,
            ExpiredOn = tenantSubscription.Frequency == SubscriptionFrequenciesEnum.Monthly
                ? DateTimeOffset.UtcNow.AddMonths(1).Date
                : DateTimeOffset.UtcNow.AddYears(1).Date,
            AvailableCredits = tenantSubscription.MaxCredits,
            Type = CreditTypesEnum.Subscription,
            TenantId = tenantSubscription.TenantId
        };

        try
        {
            // Log the creation of the credit entry
            _logger.LogInformation("Assigning {AvailableCredits} credits to TenantId {TenantId} for SubscriptionId {SubscriptionId}. Expiry Date: {ExpiredOn}",
                tenantCredit.AvailableCredits, tenantCredit.TenantId, tenantCredit.SubscriptionId, tenantCredit.ExpiredOn);

            // Insert the credit into the database
            await _unitOfWork.TenantCreditRepo.InsertAsync(tenantCredit);

            // Persist the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save the credit for TenantId {TenantId} and SubscriptionId {SubscriptionId}.", tenantCredit.TenantId, tenantCredit.SubscriptionId);
            }
            else
            {
                // Log successful credit assignment
                _logger.LogInformation("Successfully assigned credits to TenantId {TenantId} for SubscriptionId {SubscriptionId}.", tenantCredit.TenantId, tenantCredit.SubscriptionId);
            }
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the credit assignment
            _logger.LogError($"An error occurred while assigning credits to TenantId {tenantSubscription.TenantId} for SubscriptionId {tenantSubscription.Id}: {ex.Message}");
        }
    }

    private async Task HandleSubscriptionCompleted(JObject json)
    {
        // Log the incoming request for subscription completed event
        _logger.LogInformation("Handling subscription completed event.");

        // Call the helper method to process the status update to 'Completed'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Completed);
    }

    private async Task HandleSubscriptionCancelled(JObject json)
    {
        // Log the incoming request for subscription cancellation event
        _logger.LogInformation("Handling subscription cancellation event.");

        // Call the helper method to process the status update to 'Cancelled'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Cancelled);
    }

    private async Task HandleSubscriptionHalted(JObject json)
    {
        // Log the incoming request for subscription halt event
        _logger.LogInformation("Handling subscription halt event.");

        // Call the helper method to process the status update to 'Halted'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Halted);
    }

    private async Task HandleSubscriptionPending(JObject json)
    {
        // Log the incoming request for subscription pending event
        _logger.LogInformation("Handling subscription pending event.");

        // Call the helper method to process the status update to 'Halted'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Pending);
    }

    private async Task HandleSubscriptionActivated(JObject json)
    {
        // Log the incoming request for subscription activated event
        _logger.LogInformation("Handling subscription activated event.");

        // Call the helper method to process the status update to 'Active'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Active);
    }

    private async Task HandleSubscriptionResumed(JObject json)
    {
        // Log the incoming request for subscription resumed event
        _logger.LogInformation("Handling subscription resumed event.");

        // Call the helper method to process the status update to 'Paused'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Paused);
    }

    private async Task HandleSubscriptionPaused(JObject json)
    {
        // Log the incoming request for subscription paused event
        _logger.LogInformation("Handling subscription paused event.");

        // Call the helper method to process the status update to 'Paused'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Paused);
    }

    private async Task HandleSubscriptionAuthenticated(JObject json)
    {
        // Log the incoming request for subscription authenticated event
        _logger.LogInformation("Handling subscription authenticated event.");

        // Call the helper method to process the status update to 'Authenticated'
        await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Authenticated);
    }

    private async Task<TenantSubscription?> ProcessSubscriptionStatusUpdate(JObject json, SubscriptionStatusTypesEnum targetStatus)
    {
        // Declare a variable to hold the tenant subscription object, initialized to null.
        // This will eventually hold the subscription data retrieved from the database or remain null if no matching subscription is found.
        TenantSubscription? tenantSubscription = null;

        // Extract the Razorpay Subscription ID from the incoming JSON payload.
        // This assumes the JSON structure contains the subscription ID under "payload" -> "subscription" -> "entity" -> "id".
        var razorpaySubscriptionId = json["payload"]?["subscription"]?["entity"]?["id"]?.ToString();

        // Return early if the Razorpay Subscription ID is missing or invalid in the payload.
        if (string.IsNullOrEmpty(razorpaySubscriptionId))
        {
            // Log a warning if the subscription ID is missing or invalid.
            _logger.LogWarning("The subscription ID is either missing or invalid in the webhook payload.");
            return tenantSubscription;
        }

        // Log the extracted subscription ID for tracking and debugging purposes.
        _logger.LogInformation("Extracted Subscription ID: {RazorpaySubscriptionId}", razorpaySubscriptionId);

        try
        {
            // Retrieve the active subscription from the database using the Razorpay Subscription ID.
            // The query filters for subscriptions that match the Razorpay ID and are marked as active.
            tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.RazorpaySubscriptionId == razorpaySubscriptionId && w.IsActive)
                .Include(i => i.Plan)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // If no active subscription is found in the database, log a warning and return early.
            if (tenantSubscription == null)
            {
                _logger.LogWarning("No active subscription found for Razorpay Subscription ID: {RazorpaySubscriptionId}.", razorpaySubscriptionId);
                return tenantSubscription;
            }

            // Log the current status of the found subscription for debugging purposes.
            // This helps to track if any changes are required.
            _logger.LogInformation("Found subscription with ID {RazorpaySubscriptionId}, Status: {CurrentStatus}", razorpaySubscriptionId, tenantSubscription.Status);

            // If the subscription's current status matches the target status, no update is necessary.
            if (tenantSubscription.Status == targetStatus)
            {
                _logger.LogInformation("Subscription with ID {RazorpaySubscriptionId} is already in '{TargetStatus}' status. No action needed.", razorpaySubscriptionId, targetStatus);
                return tenantSubscription;
            }

            // Update the subscription's status to the target status.
            tenantSubscription.Status = targetStatus;

            // Log the action of updating the subscription status for tracking purposes.
            _logger.LogInformation("Updating subscription with ID {RazorpaySubscriptionId} to '{TargetStatus}' status.", razorpaySubscriptionId, targetStatus);

            // Update the subscription entity in the repository.
            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            // Attempt to persist the changes to the database.
            // Log an error if saving the changes fails.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save the subscription status update for Subscription ID {RazorpaySubscriptionId}.", razorpaySubscriptionId);
            }
        }
        catch (Exception ex)
        {
            // Log any unexpected errors or exceptions that occur during the subscription status update process.
            _logger.LogError($"Exception encountered while processing subscription status update for Razorpay Subscription ID {razorpaySubscriptionId}: {ex.Message}");
        }

        // Return the updated tenant subscription object (may still be null if no update was made).
        return tenantSubscription;
    }

    private async Task ProcessBillingDetail(JObject json, TenantSubscription? tenantSubscription)
    {
        // Extract the subscription ID
        var subscriptionId = json["payload"]?["subscription"]?["entity"]?["id"]?.ToString();

        if (string.IsNullOrEmpty(subscriptionId))
        {
            _logger.LogWarning("Billing detail processing skipped: Subscription ID is missing in the webhook payload.");
            return;
        }

        _logger.LogInformation("Processing billing details for Subscription ID: {SubscriptionId}", subscriptionId);

        try
        {
            var amountPaid = json["payload"]?["payment"]?["entity"]?["amount"]?.ToObject<int?>();

            // Extract the 'payment' entity as a JObject
            var paymentEntity = json["payload"]?["payment"]?["entity"] as JObject;

            // Optional: Extract invoice/charge/payment-related details
            if (tenantSubscription == null)
            {
                // Retrieve the corresponding subscription
                tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                    .GetByConditionAsync(s => s.RazorpaySubscriptionId == subscriptionId && s.IsActive)
                    .Include(i => i.Plan)
                    .FirstOrDefaultAsync();
            }

            if (tenantSubscription == null)
            {
                _logger.LogWarning("Billing detail processing failed: Subscription with ID {SubscriptionId} not found.", subscriptionId);
                return;
            }

            var lastBillingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w =>
                    w.TenantId == tenantSubscription.TenantId &&
                    w.SubscriptionId == tenantSubscription.Id &&
                    w.CreatedOn >= tenantSubscription.NextBillingDate
                )
                .FirstOrDefaultAsync();

            var razorpayPaymentId = paymentEntity["id"]?.ToString();

            // Check if the Razorpay Payment ID already exists in the BillingDetail table
            var existingBillingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w =>
                    w.TenantId == tenantSubscription.TenantId &&
                    w.SubscriptionId == tenantSubscription.Id &&
                    w.RazorpayPaymentId == razorpayPaymentId
                )
                .FirstOrDefaultAsync();

            if (existingBillingDetail != null)
            {
                // Update the existing record if found
                _logger.LogInformation("Updating existing billing record for Razorpay Payment ID {RazorpayPaymentId}", paymentEntity["id"]);

                existingBillingDetail.Amount = paymentEntity["amount"]?.ToObject<int?>() / 100 ?? 0;
                existingBillingDetail.RazorpayInvoiceId = paymentEntity["invoice_id"]?.ToObject<string?>() ?? string.Empty;
                existingBillingDetail.RazorpayOrderId = paymentEntity["order_id"]?.ToObject<string?>() ?? string.Empty;
                existingBillingDetail.PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true);
                existingBillingDetail.BillingEmail = paymentEntity["email"]?.ToObject<string?>() ?? string.Empty;
                existingBillingDetail.ContactPerson = paymentEntity["contact"]?.ToObject<string?>() ?? string.Empty;
                existingBillingDetail.LastModifiedByUserId = tenantSubscription.CreatedByUserId;

                // Save the updated record
                _unitOfWork.BillingDetailRepo.Update(existingBillingDetail);
            }
            else
            {
                // Create a new billing record if not found
                _logger.LogInformation("Creating new billing record for Razorpay Payment ID {RazorpayPaymentId}", paymentEntity["id"]);

                var billingRecord = new BillingDetail
                {
                    SubscriptionId = tenantSubscription.Id,
                    Amount = paymentEntity["amount"]?.ToObject<int?>() / 100 ?? 0,
                    RazorpayInvoiceId = paymentEntity["invoice_id"]?.ToObject<string?>() ?? string.Empty,
                    RazorpayPaymentId = paymentEntity["id"]?.ToObject<string?>() ?? string.Empty,
                    RazorpayOrderId = paymentEntity["order_id"]?.ToObject<string?>() ?? string.Empty,
                    PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true),
                    BillingEmail = paymentEntity["email"]?.ToObject<string?>() ?? string.Empty,
                    ContactPerson = paymentEntity["contact"]?.ToObject<string?>() ?? string.Empty,
                    AddressLine1 = lastBillingDetail?.AddressLine1 ?? string.Empty,
                    AddressLine2 = lastBillingDetail?.AddressLine2,
                    City = lastBillingDetail?.City ?? string.Empty,
                    State = lastBillingDetail?.State ?? string.Empty,
                    Country = lastBillingDetail?.Country ?? CountriesEnum.India,
                    PostalCode = lastBillingDetail?.PostalCode ?? string.Empty,
                    CreatedByUserId = tenantSubscription.CreatedByUserId,
                    LastModifiedByUserId = tenantSubscription.CreatedByUserId,
                    TenantId = tenantSubscription.TenantId
                };

                // Save the new billing record
                await _unitOfWork.BillingDetailRepo.InsertAsync(billingRecord);
            }

            // Commit the transaction
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save billing record for Subscription ID {SubscriptionId}.", subscriptionId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while processing billing details for Razorpay Subscription ID {SubscriptionId}", subscriptionId);
        }
    }
}