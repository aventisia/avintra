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

            case "payment.authorized":
                await ProcessPaymentHistoryAsync(json, PaymentStatusTypesEnum.Authorized); break;

            case "payment.failed":
                await ProcessPaymentHistoryAsync(json, PaymentStatusTypesEnum.Failed); break;

            case "payment.captured":
                await ProcessPaymentHistoryAsync(json, PaymentStatusTypesEnum.Captured); break;

            // ========================== Order Events ==========================

            case "order.paid":
                await ProcessOrderPaidAsync(json); break;

            // case "order.notification.delivered":
            //     await HandleOrderNotificationDelivered(json); break;

            // case "order.notification.failed":
            //     await HandleOrderNotificationFailed(json); break;

            // ========================== Invoice Events ==========================

            case "invoice.paid":
                await ProcessInvoicePaidAsync(json); break;

            // case "invoice.partially_paid":
            //     await HandleInvoicePartiallyPaid(json); break;

            // case "invoice.expired":
            //     await HandleInvoiceExpired(json); break;  

            // ========================== Subscription Events ==========================

            case "subscription.authenticated":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Authenticated);
                break;

            case "subscription.paused":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Paused);
                break;

            case "subscription.resumed":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Paused);
                break;

            case "subscription.activated":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Active);
                break;

            case "subscription.pending":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Pending);
                break;

            case "subscription.halted":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Halted);
                break;

            case "subscription.charged":
                // Log the event of receiving a subscription charge webhook
                _logger.LogInformation("Processing subscription charge event.");

                // Invoke the method to handle the subscription status update to 'Active'
                TenantSubscription? tenantSubscription = await HandleActivateSubscriptionStatus(json);

                // Handle and save billing-related information from the webhook
                await ProcessBillingDetail(json, tenantSubscription);

                // Allocate credits based on the subscription details
                await AssignCreditAsync(tenantSubscription);
                break;

            case "subscription.cancelled":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Cancelled);
                break;

            case "subscription.completed":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Completed);
                break;

            case "subscription.updated":
                await ProcessSubscriptionStatusUpdate(json, SubscriptionStatusTypesEnum.Authenticated);
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

    // Method to handle the activation of a subscription based on the webhook data.
    private async Task<TenantSubscription?> HandleActivateSubscriptionStatus(JObject json)
    {
        // Initialize the tenant subscription variable, which will hold the subscription data.
        TenantSubscription? tenantSubscription = null;

        // Extract the Razorpay subscription entity from the incoming JSON payload.
        var razorpaySubscriptionEntity = json["payload"]?["subscription"]?["entity"];

        // Extract Razorpay Subscription ID and Customer ID from the entity.
        var razorpaySubscriptionId = razorpaySubscriptionEntity?["id"]?.ToString();
        var razorpayCustomerId = razorpaySubscriptionEntity?["customer_id"]?.ToString();

        // If Razorpay Subscription ID is missing or invalid, log a warning and return early.
        if (string.IsNullOrEmpty(razorpaySubscriptionId))
        {
            _logger.LogWarning("The Razorpay Subscription ID is missing or invalid in the payload.");
            return null;
        }

        // Log the extracted Razorpay Subscription ID for tracking purposes.
        _logger.LogInformation("Extracted Razorpay Subscription ID: {RazorpaySubscriptionId}", razorpaySubscriptionId);

        try
        {
            // Fetch the tenant associated with the Razorpay Customer ID.
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.RazorpayCustomerId == razorpayCustomerId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return.
            if (tenant == null)
            {
                _logger.LogWarning("No tenant found for Razorpay Customer ID: {RazorpayCustomerId}.", razorpayCustomerId);
                return null;
            }

            // Log tenant information to verify we have found the correct tenant.
            _logger.LogInformation("Found tenant with Razorpay Customer ID: {RazorpayCustomerId}", razorpayCustomerId);

            // Retrieve the current active subscription for the tenant.
            var currentTenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(s => s.TenantId == tenant.Id && s.IsActive)
                .Include(i => i.Plan)
                .FirstOrDefaultAsync();

            // If no active subscription is found, log a warning and deactivate it.
            if (currentTenantSubscription != null)
            {
                _logger.LogWarning("No active subscription found for Razorpay Subscription ID: {RazorpaySubscriptionId}.", razorpaySubscriptionId);

                // Mark subscription as inactive (deactivation step).
                currentTenantSubscription.IsActive = false;
                currentTenantSubscription.LastModifiedByUserId = tenant.LastModifiedByUserId;

                // Update the subscription status to inactive in the repository.
                _unitOfWork.TenantSubscriptionRepo.Update(currentTenantSubscription);
                _logger.LogInformation("Deactivated subscription with Razorpay Subscription ID: {RazorpaySubscriptionId}.", razorpaySubscriptionId);

                // Handle credits for the Starter plan if applicable.
                if (currentTenantSubscription.Plan.Type == SubscriptionPlanTypeEnum.Starter)
                {
                    var tenantCredit = await _unitOfWork.TenantCreditRepo
                        .GetByConditionAsync(c => c.TenantId == tenant.Id && c.SubscriptionId == currentTenantSubscription.Id)
                        .FirstOrDefaultAsync();

                    // If credits exist, reset them to 0.
                    if (tenantCredit != null)
                    {
                        tenantCredit.AvailableCredits = 0;
                        tenantCredit.LastModifiedByUserId = tenant.LastModifiedByUserId;
                        _unitOfWork.TenantCreditRepo.Update(tenantCredit);
                        _logger.LogInformation("Reset credits for Tenant ID: {TenantId}, Subscription ID: {SubscriptionId}.", tenant.Id, currentTenantSubscription.Id);
                    }
                }
            }

            // Retrieve the subscription corresponding to the Razorpay Subscription ID.
            tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(s => s.TenantId == tenant.Id && s.RazorpaySubscriptionId == razorpaySubscriptionId)
                .Include(i => i.Plan)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // If no matching subscription is found, log a warning and return null.
            if (tenantSubscription == null)
            {
                _logger.LogWarning("No matching active subscription found for Razorpay Subscription ID: {RazorpaySubscriptionId}.", razorpaySubscriptionId);
                return null;
            }

            // Log the current status of the subscription for debugging purposes.
            _logger.LogInformation("Found subscription with Razorpay Subscription ID: {RazorpaySubscriptionId}, Current Status: {CurrentStatus}", razorpaySubscriptionId, tenantSubscription.Status);

            // Extract subscription start and end dates from the Razorpay subscription entity.
            DateTimeOffset? subscriptionStartDate = razorpaySubscriptionEntity["current_start"] != null
                ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(razorpaySubscriptionEntity["current_start"])).ToUniversalTime()
                : (DateTimeOffset?)null;

            DateTimeOffset? subscriptionEndDate = razorpaySubscriptionEntity["current_end"] != null
                ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(razorpaySubscriptionEntity["current_end"])).ToUniversalTime()
                : (DateTimeOffset?)null;

            _logger.LogInformation("Subscription Start Date: {StartDate}, End Date: {EndDate}", subscriptionStartDate, subscriptionEndDate);

            // Calculate the next billing date based on the subscription's end date, or default to the frequency (monthly or yearly).
            var nextBillingDate = subscriptionEndDate ?? (tenantSubscription.Frequency == SubscriptionFrequenciesEnum.Monthly
                ? DateTimeOffset.UtcNow.AddMonths(1)
                : DateTimeOffset.UtcNow.AddYears(1));

            // Update subscription details including the next billing date and status.
            tenantSubscription.NextBillingDate = nextBillingDate;
            tenantSubscription.IsActive = true;
            tenantSubscription.Status = SubscriptionStatusTypesEnum.Active;
            tenantSubscription.LastModifiedByUserId = tenant.LastModifiedByUserId;

            _logger.LogInformation("Updated Subscription with Razorpay Subscription ID: {RazorpaySubscriptionId} to Active status. Next Billing Date: {NextBillingDate}", razorpaySubscriptionId, nextBillingDate);

            // Update the subscription entity in the repository.
            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            // Attempt to save changes to the database, and log an error if it fails.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save the subscription status update for Razorpay Subscription ID: {RazorpaySubscriptionId}.", razorpaySubscriptionId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while processing the subscription activation for Razorpay Subscription ID: {razorpaySubscriptionId}. Error: {ex.Message}");
        }

        // Return the updated tenant subscription, or null if no update was made.
        return tenantSubscription;
    }

    private async Task<TenantSubscription?> ProcessSubscriptionStatusUpdate(JObject json, SubscriptionStatusTypesEnum targetStatus)
    {
        // Declare a variable to hold the tenant subscription object, initialized to null.
        // This will eventually hold the subscription data retrieved from the database or remain null if no matching subscription is found.
        TenantSubscription? tenantSubscription = null;

        // Extract the Razorpay subscription entity from the incoming JSON payload.
        var razorpaySubscriptionEntity = json["payload"]?["subscription"]?["entity"];

        // Extract the Razorpay Subscription ID directly from the "entity" object.
        var razorpaySubscriptionId = razorpaySubscriptionEntity["id"]?.ToString();
        var razorpayCustomerId = razorpaySubscriptionEntity?["customer_id"]?.ToString();

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
            // Fetch the tenant associated with the Razorpay Customer ID.
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.RazorpayCustomerId == razorpayCustomerId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return.
            if (tenant == null)
            {
                _logger.LogWarning("No tenant found for Razorpay Customer ID: {RazorpayCustomerId}.", razorpayCustomerId);
                return null;
            }
            // Retrieve the active subscription from the database using the Razorpay Subscription ID.
            // The query filters for subscriptions that match the Razorpay ID and are marked as active.
            tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.TenantId == tenant.Id && w.RazorpaySubscriptionId == razorpaySubscriptionId)
                .Include(i => i.Plan)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // If no active subscription is found in the database, log a warning and return early.
            if (tenantSubscription == null)
            {
                _logger.LogWarning("No active subscription found for Razorpay Subscription ID: {RazorpaySubscriptionId}.", razorpaySubscriptionId);
                return tenantSubscription;
            }

            tenantSubscription.Status = targetStatus;

            // Log the action of updating the subscription status for tracking purposes.
            _logger.LogInformation("Updating subscription with ID {RazorpaySubscriptionId} to '{TargetStatus}' status.", razorpaySubscriptionId, targetStatus);

            // Update the subscription entity in the repository.
            _unitOfWork.TenantSubscriptionRepo.Update(tenantSubscription);

            // Attempt to persist the changes to the database.
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
                    .GetByConditionAsync(w => w.TenantId == tenantSubscription.TenantId && w.RazorpaySubscriptionId == subscriptionId)
                    .Include(i => i.Plan)
                    .FirstOrDefaultAsync();
            }

            if (tenantSubscription == null)
            {
                _logger.LogWarning("Billing detail processing failed: Subscription with ID {SubscriptionId} not found.", subscriptionId);
                return;
            }

            // Get the most recent billing detail with valid contact and address
            var lastBillingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == tenantSubscription.TenantId)
                .OrderByDescending(o => o.CreatedOn)
                .FirstOrDefaultAsync();

            // Extract Razorpay Payment ID from payment entity
            var razorpayPaymentId = paymentEntity["id"]?.ToString();

            // Check if a billing record already exists for this Razorpay payment and subscription
            var existingBillingHistory = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w =>
                    w.TenantId == tenantSubscription.TenantId &&
                    w.BillingDetailId == lastBillingDetail.Id &&
                    (w.RazorpayPaymentId == razorpayPaymentId || w.RazorpayPaymentId == null)
                )
                .FirstOrDefaultAsync();

            if (existingBillingHistory != null)
            {
                // Update the existing record if found
                _logger.LogInformation("Updating existing billing record for Razorpay Payment ID {RazorpayPaymentId}", paymentEntity["id"]);

                existingBillingHistory.Amount = paymentEntity["amount"]?.ToObject<int?>() / 100 ?? 0;
                existingBillingHistory.RazorpayInvoiceId = paymentEntity["invoice_id"]?.ToObject<string?>() ?? string.Empty;
                existingBillingHistory.RazorpayOrderId = paymentEntity["order_id"]?.ToObject<string?>() ?? string.Empty;
                existingBillingHistory.PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true);
                existingBillingHistory.LastModifiedByUserId = tenantSubscription.CreatedByUserId;

                // Save the updated record
                _unitOfWork.BillingHistoryRepo.Update(existingBillingHistory);
            }
            else
            {
                // Create a new billing record if not found
                _logger.LogInformation("Creating new billing history record for Razorpay Payment ID {RazorpayPaymentId}", paymentEntity["id"]);

                var billingHistory = new BillingHistory
                {
                    BillingDetailId = lastBillingDetail.Id,
                    Amount = paymentEntity["amount"]?.ToObject<int?>() / 100 ?? 0,
                    RazorpayInvoiceId = paymentEntity["invoice_id"]?.ToObject<string?>() ?? string.Empty,
                    RazorpayPaymentId = paymentEntity["id"]?.ToObject<string?>() ?? string.Empty,
                    RazorpayOrderId = paymentEntity["order_id"]?.ToObject<string?>() ?? string.Empty,
                    PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true),
                    Currency = (CurrencyTypesEnum)Enum.Parse(typeof(CurrencyTypesEnum), paymentEntity["currency"]?.ToString(), ignoreCase: true),
                    CreatedByUserId = tenantSubscription.CreatedByUserId,
                    LastModifiedByUserId = tenantSubscription.CreatedByUserId,
                    TenantId = tenantSubscription.TenantId
                };

                // Save the new billing record
                await _unitOfWork.BillingHistoryRepo.InsertAsync(billingHistory);
            }

            // Commit the transaction
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save billing history record for Subscription ID {SubscriptionId}.", subscriptionId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while processing billing details for Razorpay Subscription ID {SubscriptionId}", subscriptionId);
        }
    }

    private async Task AssignCreditAsync(TenantSubscription? tenantSubscription)
    {
        if (tenantSubscription == null)
        {
            _logger.LogError("Tenant subscription is null. Cannot assign credit.");
            return;
        }

        // Get the total credits available for the tenant
        ulong totalCredits = await GetCalculateTotalCreditsForTenantAsync(tenantSubscription.TenantId, tenantSubscription.MaxCredits);

        // Create a new TenantCredit entry for the tenant
        var tenantCredit = new TenantCredit()
        {
            SubscriptionId = tenantSubscription.Id,
            CreditedOn = DateTimeOffset.UtcNow,
            ExpiredOn = tenantSubscription.Frequency == SubscriptionFrequenciesEnum.Monthly
                        ? DateTimeOffset.UtcNow.AddMonths(1).Date
                        : DateTimeOffset.UtcNow.AddYears(1).Date,
            AvailableCredits = totalCredits,
            Type = CreditTypesEnum.Subscription,
            TenantId = tenantSubscription.TenantId,
            CreatedByUserId = tenantSubscription.CreatedByUserId,
            LastModifiedByUserId = tenantSubscription.LastModifiedByUserId,
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
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the credit assignment
            _logger.LogError($"An error occurred while assigning credits to TenantId {tenantSubscription.TenantId} for SubscriptionId {tenantSubscription.Id}: {ex.Message}");
        }
    }

    private async Task ProcessPaymentHistoryAsync(JObject webhookPayload, PaymentStatusTypesEnum targetPaymentStatus)
    {
        // Extract Razorpay Payment ID from the payload
        var razorpayPaymentId = webhookPayload["payload"]?["payment"]?["entity"]?["id"]?.ToString();
        if (string.IsNullOrEmpty(razorpayPaymentId))
        {
            _logger.LogWarning("Razorpay Payment ID is missing or invalid in the webhook payload.");
            return;
        }

        try
        {
            // Extract payment details from the webhook payload
            var paymentEntity = webhookPayload["payload"]?["payment"]?["entity"];
            var razorpayCustomerId = paymentEntity?["customer_id"]?.ToString();
            var razorpayPaymentCardId = paymentEntity?["card_id"]?.ToString();

            Guid tenantId = Guid.Empty;

            // Check if Razorpay Customer ID is provided in the payload
            if (string.IsNullOrEmpty(razorpayCustomerId))
            {
                // If no Razorpay Customer ID, fetch the billing detail using Razorpay Order ID
                var razorpayOrderId = paymentEntity?["order_id"]?.ToString();

                // Attempt to fetch the billing detail from the database based on the Razorpay Order ID
                var billingHistory = await _unitOfWork.BillingHistoryRepo
                    .GetByConditionAsync(w => w.RazorpayOrderId == razorpayOrderId)
                    .FirstOrDefaultAsync();

                if (billingHistory == null)
                {
                    // Log a warning if the billing detail is missing or invalid
                    _logger.LogWarning("Missing or invalid Razorpay Customer ID in the payload.");
                    return;
                }

                // Extract Tenant ID from the billing detail if found
                tenantId = billingHistory.TenantId;
            }
            else
            {
                // If Razorpay Customer ID is present, fetch tenant using Razorpay Customer ID
                var tenant = await _unitOfWork.TenantRepo
                    .GetByConditionAsync(p => p.RazorpayCustomerId == razorpayCustomerId)
                    .FirstOrDefaultAsync();

                if (tenant == null)
                {
                    // Log a warning if tenant associated with the Razorpay Customer ID is not found
                    _logger.LogWarning("Tenant not found for Razorpay Customer ID: {RazorpayCustomerId}", razorpayCustomerId);
                    return;
                }
                tenantId = tenant.Id;
            }

            // Retrieve payment method from the repository, or create a new one if not found
            var paymentMethod = await _unitOfWork.PaymentMethodRepo
                .GetByConditionAsync(w => w.RazorpayMethodId == razorpayPaymentCardId && w.TenantId == tenantId)
                .FirstOrDefaultAsync();

            if (paymentMethod == null)
            {
                var card = paymentEntity?["card"];
                paymentMethod = new PaymentMethod
                {
                    TenantId = tenantId,
                    RazorpayMethodId = razorpayPaymentCardId,
                    Type = (PaymentMethodTypesEnum)Enum.Parse(typeof(PaymentMethodTypesEnum), paymentEntity?["method"]?.ToString(), ignoreCase: true),
                    Wallet = paymentEntity?["wallet"]?.ToString(),
                    Vpa = paymentEntity?["vpa"]?.ToString(),
                    CardLast4 = card?["last4"]?.ToString(),
                    CardNetwork = card != null ? (CardNetworkTypesEnum?)Enum.Parse(typeof(CardNetworkTypesEnum), card["network"]?.ToString(), ignoreCase: true) : null,
                    CardType = card != null ? (CardTypesEnum?)Enum.Parse(typeof(CardTypesEnum), card["type"]?.ToString(), ignoreCase: true) : null,
                    CardIssuer = card?["issuer"]?.ToString(),
                    Name = card?["name"]?.ToString(),
                    CardInternational = card?["international"]?.Value<bool>() ?? false,
                };

                // Insert the new payment method into the repository
                await _unitOfWork.PaymentMethodRepo.InsertAsync(paymentMethod);

                // Save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save payment method for Razorpay Payment ID: {RazorpayPaymentId}", razorpayPaymentId);
                }
            }

            // Create a new PaymentHistory object
            var paymentHistoryRequest = new PaymentHistory
            {
                RazorpayPaymentId = razorpayPaymentId,
                PaymentMethodId = paymentMethod != null ? paymentMethod.Id : null,
                OrderId = paymentEntity?["order_id"]?.ToString(),
                InvoiceId = paymentEntity?["invoice_id"]?.ToString(),
                Currency = (CurrencyTypesEnum)Enum.Parse(typeof(CurrencyTypesEnum), paymentEntity["currency"]?.ToString(), ignoreCase: true),
                Status = targetPaymentStatus,
                Captured = paymentEntity?["captured"]?.Value<bool>() ?? false,
                Amount = (paymentEntity["amount"]?.Value<int>() ?? 0) / 100m,
                Fee = (paymentEntity["fee"]?.Value<int?>() ?? 0) / 100m,
                Tax = (paymentEntity["tax"]?.Value<int?>() ?? 0) / 100m,
                Description = paymentEntity?["description"]?.ToString(),
                Email = paymentEntity?["email"]?.ToString(),
                Contact = paymentEntity?["contact"]?.ToString(),
                TenantId = tenantId
            };

            // Process the payment history based on its status
            if (targetPaymentStatus == PaymentStatusTypesEnum.Authorized || targetPaymentStatus == PaymentStatusTypesEnum.Failed)
            {
                // Add a new payment history record if the status is "Authorized" or "Failed"
                await _unitOfWork.PaymentHistoryRepo.InsertAsync(paymentHistoryRequest);
            }
            else
            {
                // Try to find an existing payment history record for the same RazorpayPaymentId
                var existingPaymentHistory = await _unitOfWork.PaymentHistoryRepo
                    .GetByConditionAsync(w => w.RazorpayPaymentId == razorpayPaymentId)
                    .FirstOrDefaultAsync();

                if (existingPaymentHistory != null)
                {
                    paymentHistoryRequest.Id = existingPaymentHistory.Id;

                    // Update the existing payment history record with the new data
                    _unitOfWork.PaymentHistoryRepo.Update(paymentHistoryRequest);
                }
            }

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save payment history for Razorpay Payment ID: {RazorpayPaymentId}", razorpayPaymentId);
            }
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the processing
            _logger.LogError(ex, "Error processing payment history for Razorpay Payment ID: {RazorpayPaymentId}", razorpayPaymentId);
        }
    }

    private async Task ProcessOrderPaidAsync(JObject webhookPayload)
    {
        // Extract Razorpay Payment ID from the payload
        var razorpayPaymentId = webhookPayload["payload"]?["payment"]?["entity"]?["id"]?.ToString();
        if (string.IsNullOrEmpty(razorpayPaymentId))
        {
            _logger.LogWarning("Razorpay Payment ID is missing or invalid in the webhook payload.");
            return;
        }

        try
        {
            // Extract payment details from the webhook payload
            var paymentEntity = webhookPayload["payload"]?["payment"]?["entity"];

            // If no Razorpay Customer ID, fetch the billing detail using Razorpay Order ID
            var razorpayOrderId = paymentEntity?["order_id"]?.ToString();

            // Attempt to fetch the billing detail from the database based on the Razorpay Order ID
            var billingHistory = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w => w.RazorpayOrderId == razorpayOrderId)
                .Include(i => i.BillingDetail)
                .FirstOrDefaultAsync();

            if (billingHistory == null)
            {
                // Log a warning if the billing detail is missing or invalid
                _logger.LogWarning("Missing or invalid Razorpay Customer ID in the payload.");
                return;
            }

            billingHistory.PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true);
            billingHistory.RazorpayPaymentId = razorpayPaymentId;
            billingHistory.LastModifiedByUserId = billingHistory.LastModifiedByUserId;

            _unitOfWork.BillingHistoryRepo.Update(billingHistory);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to update billing detail for Razorpay Payment ID: {RazorpayPaymentId}", razorpayPaymentId);
            }

            // Get the total credits available for the tenant
            ulong totalCredits = await GetCalculateTotalCreditsForTenantAsync(billingHistory.TenantId, (ulong)billingHistory.Quantity);

            // Create a new TenantCredit entry for the tenant
            var tenantCredit = new TenantCredit()
            {
                AvailableCredits = totalCredits,
                Type = CreditTypesEnum.TopUp,
                CreditedOn = DateTimeOffset.UtcNow,
                ExpiredOn = DateTimeOffset.UtcNow.AddYears(1).Date,
                SubscriptionId = billingHistory.BillingDetail.SubscriptionId,
                TenantId = billingHistory.TenantId,
                CreatedByUserId = billingHistory.CreatedByUserId,
                LastModifiedByUserId = billingHistory.CreatedByUserId,
            };

            await _unitOfWork.TenantCreditRepo.InsertAsync(tenantCredit);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save tenant credits for Razorpay Payment ID: {RazorpayPaymentId}", razorpayPaymentId);
            }
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the processing
            _logger.LogError(ex, "Error processing payment history for Razorpay Payment ID: {RazorpayPaymentId}", razorpayPaymentId);
        }
    }

    private async Task ProcessInvoicePaidAsync(JObject json)
    {
        // Extract the subscription ID from the webhook payload
        var subscriptionId = json["payload"]?["invoice"]?["entity"]?["subscription_id"]?.ToString();
        if (string.IsNullOrEmpty(subscriptionId))
        {
            _logger.LogWarning("Billing processing skipped: Subscription ID is missing from the webhook payload.");
            return;
        }

        _logger.LogInformation("Processing billing details for Subscription ID: {SubscriptionId}", subscriptionId);

        try
        {
            // Extract payment details from the webhook payload
            var amountPaid = json["payload"]?["invoice"]?["entity"]?["amount"]?.ToObject<int?>();
            var invoiceLink = json["payload"]?["invoice"]?["entity"]?["short_url"]?.ToObject<string?>();

            // Retrieve the payment entity from the payload
            var paymentEntity = json["payload"]?["payment"]?["entity"] as JObject;

            // Retrieve the tenant subscription from the database
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                 .GetByConditionAsync(w => w.RazorpaySubscriptionId == subscriptionId)
                 .Include(i => i.Plan)
                 .FirstOrDefaultAsync();

            if (tenantSubscription == null)
            {
                _logger.LogWarning("Billing processing failed: Subscription with ID {SubscriptionId} not found in the system.", subscriptionId);
                return;
            }

            // Retrieve the most recent billing record for the tenant with valid contact and address details
            var lastBillingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == tenantSubscription.TenantId)
                .OrderByDescending(o => o.CreatedOn)
                .FirstOrDefaultAsync();

            // Extract Razorpay Payment ID from the payment entity
            var razorpayPaymentId = paymentEntity["id"]?.ToString();

            // Check if a billing record already exists for this Razorpay payment and subscription
            var existingHistoryDetail = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w =>
                    w.TenantId == tenantSubscription.TenantId &&
                    w.BillingDetailId == lastBillingDetail.Id &&
                    (w.RazorpayPaymentId == razorpayPaymentId || w.RazorpayPaymentId == null)
                )
                .FirstOrDefaultAsync();

            if (existingHistoryDetail != null)
            {
                // Update the existing billing record if found
                _logger.LogInformation("Updating existing billing record for Razorpay Payment ID {RazorpayPaymentId}", razorpayPaymentId);

                existingHistoryDetail.Amount = paymentEntity["amount"]?.ToObject<int?>() / 100 ?? 0;
                existingHistoryDetail.InvoiceLink = invoiceLink;
                existingHistoryDetail.RazorpayInvoiceId = paymentEntity["invoice_id"]?.ToObject<string?>() ?? string.Empty;
                existingHistoryDetail.RazorpayOrderId = paymentEntity["order_id"]?.ToObject<string?>() ?? string.Empty;
                existingHistoryDetail.PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true);
                existingHistoryDetail.LastModifiedByUserId = tenantSubscription.CreatedByUserId;

                // Save the updated billing record
                _unitOfWork.BillingHistoryRepo.Update(existingHistoryDetail);
            }
            else
            {
                // Create a new billing record if no existing record is found
                _logger.LogInformation("Creating new billing record for Razorpay Payment ID {RazorpayPaymentId}", razorpayPaymentId);

                var billingHistory = new BillingHistory
                {
                    BillingDetailId = lastBillingDetail.Id,
                    Amount = paymentEntity["amount"]?.ToObject<int?>() / 100 ?? 0,
                    InvoiceLink = invoiceLink,
                    Type = CreditTypesEnum.Subscription,
                    RazorpayInvoiceId = paymentEntity["invoice_id"]?.ToObject<string?>() ?? string.Empty,
                    RazorpayPaymentId = paymentEntity["id"]?.ToObject<string?>() ?? string.Empty,
                    RazorpayOrderId = paymentEntity["order_id"]?.ToObject<string?>() ?? string.Empty,
                    PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true),
                    Currency = (CurrencyTypesEnum)Enum.Parse(typeof(CurrencyTypesEnum), paymentEntity["currency"]?.ToString(), ignoreCase: true),
                    CreatedByUserId = tenantSubscription.CreatedByUserId,
                    LastModifiedByUserId = tenantSubscription.CreatedByUserId,
                    TenantId = tenantSubscription.TenantId
                };

                // Save the new billing record to the database
                await _unitOfWork.BillingHistoryRepo.InsertAsync(billingHistory);
            }

            // Commit changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save billing record for Subscription ID {SubscriptionId}.", subscriptionId);
            }
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the process
            _logger.LogError(ex, "An error occurred while processing billing details for Razorpay Subscription ID {SubscriptionId}", subscriptionId);
        }
    }

    public async Task<ulong> GetCalculateTotalCreditsForTenantAsync(Guid tenantId, ulong maxCredits)
    {
        // Query available credits for the tenant with negative available credits
        var availableCredits = await _unitOfWork.TenantCreditRepo
            .GetByConditionAsync(w =>
                w.TenantId == tenantId &&
                w.AvailableCredits < 0
            )
            .ToListAsync();

        // If no negative credits are found, return maxCredits
        if (!availableCredits.Any())
        {
            _logger.LogInformation("No negative credits found for TenantId: {TenantId}.", tenantId);
            return maxCredits;
        }

        // Calculate the total negative credit balance (we negate the sum to handle negative values correctly)
        double totalNegativeCredits = availableCredits.Sum(a => a.AvailableCredits);

        // Ensure the totalCredits never goes below 0
        ulong totalCredits = (ulong)(maxCredits + totalNegativeCredits);
        return totalCredits;
    }
}