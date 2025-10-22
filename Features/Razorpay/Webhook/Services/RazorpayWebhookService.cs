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
                await HandleSubscriptionCharged(json);
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

    private async Task<TenantSubscription?> ProcessSubscriptionStatusUpdate(JObject json, SubscriptionStatusTypesEnum targetStatus)
    {
        // Declare a variable to hold the tenant subscription object, initialized to null.
        // This will eventually hold the subscription data retrieved from the database or remain null if no matching subscription is found.
        TenantSubscription? tenantSubscription = null;

        // Extract the Razorpay subscription entity from the incoming JSON payload.
        var razorpaySubscriptionEntity = json["payload"]?["subscription"]?["entity"];

        // Extract the Razorpay Subscription ID directly from the "entity" object.
        var razorpaySubscriptionId = razorpaySubscriptionEntity["id"]?.ToString();

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
            _logger.LogInformation("Found subscription with ID {RazorpaySubscriptionId}, Status: {CurrentStatus}", razorpaySubscriptionId, tenantSubscription.Status);

            switch (targetStatus)
            {
                case SubscriptionStatusTypesEnum.Active:
                    // Extract 'current_start' from the Razorpay subscription entity and convert it to DateTimeOffset in UTC or return null.
                    DateTimeOffset? subscriptionStartDate = razorpaySubscriptionEntity["current_start"] != null
                        ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(razorpaySubscriptionEntity["current_start"])).ToUniversalTime()
                        : (DateTimeOffset?)null;

                    // Extract 'current_end' from the Razorpay subscription entity and convert it to DateTimeOffset in UTC or return null.
                    DateTimeOffset? subscriptionEndDate = razorpaySubscriptionEntity["current_end"] != null
                        ? DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(razorpaySubscriptionEntity["current_end"])).ToUniversalTime()
                        : (DateTimeOffset?)null;

                    // Set calculatedNextBillingDate to subscriptionEndDate initially
                    var calculatedNextBillingDate = subscriptionEndDate;

                    // If 'current_end' (subscriptionEndDate) is null, calculate the next billing date based on the subscription frequency (Monthly or Yearly)
                    if (calculatedNextBillingDate == null)
                    {
                        calculatedNextBillingDate = tenantSubscription.Frequency == SubscriptionFrequenciesEnum.Monthly
                            ? DateTimeOffset.UtcNow.AddMonths(1)
                            : DateTimeOffset.UtcNow.AddYears(1);
                    }

                    tenantSubscription.NextBillingDate = calculatedNextBillingDate;
                    break;

                // You can add more cases here for other statuses if needed.
                default:
                    // For any other status, update the subscription's status to the target status.
                    tenantSubscription.Status = targetStatus;
                    break;
            }

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

            // Get all billing records for the tenant
            var billingRecordsQuery = _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == tenantSubscription.TenantId)
                .OrderByDescending(o => o.CreatedOn);

            // Get the most recent billing detail with valid contact and address
            var lastBillingDetail = await billingRecordsQuery
                .FirstOrDefaultAsync(w => w.ContactPerson != null && w.AddressLine1 != null);

            // Extract Razorpay Payment ID from payment entity
            var razorpayPaymentId = paymentEntity["id"]?.ToString();

            // Check if a billing record already exists for this Razorpay payment and subscription
            var existingBillingDetail = await billingRecordsQuery
                .FirstOrDefaultAsync(w =>
                    w.TenantId == tenantSubscription.TenantId &&
                    w.SubscriptionId == tenantSubscription.Id &&
                    (w.RazorpayPaymentId == razorpayPaymentId || w.RazorpayPaymentId == null)
                );

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
                    Currency = (CurrencyTypesEnum)Enum.Parse(typeof(CurrencyTypesEnum), paymentEntity["currency"]?.ToString(), ignoreCase: true),
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
                var billingDetail = await _unitOfWork.BillingDetailRepo
                    .GetByConditionAsync(w => w.RazorpayOrderId == razorpayOrderId)
                    .FirstOrDefaultAsync();

                if (billingDetail == null)
                {
                    // Log a warning if the billing detail is missing or invalid
                    _logger.LogWarning("Missing or invalid Razorpay Customer ID in the payload.");
                    return;
                }

                // Extract Tenant ID from the billing detail if found
                tenantId = billingDetail.TenantId;
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
                    RazorpayMethodId = card?["id"]?.ToString(),
                    Type = (PaymentMethodTypesEnum)Enum.Parse(typeof(PaymentMethodTypesEnum), paymentEntity?["method"]?.ToString(), ignoreCase: true),
                    Wallet = paymentEntity?["wallet"]?.ToString(),
                    Vpa = paymentEntity?["vpa"]?.ToString(),
                    CardLast4 = card?["last4"]?.ToString(),
                    CardNetwork = (CardNetworkTypesEnum)Enum.Parse(typeof(CardNetworkTypesEnum), card?["network"]?.ToString(), ignoreCase: true),
                    CardType = (CardTypesEnum)Enum.Parse(typeof(CardTypesEnum), card?["type"]?.ToString(), ignoreCase: true),
                    CardIssuer = card?["issuer"]?.ToString(),
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

            // Prepare the PaymentHistory object
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
                Contact = paymentEntity?["contact"]?.ToString()
            };

            // Handle the payment history based on status
            if (targetPaymentStatus == PaymentStatusTypesEnum.Authorized || targetPaymentStatus == PaymentStatusTypesEnum.Failed)
            {
                // Set tenant-specific fields
                paymentHistoryRequest.TenantId = tenantId;

                // Insert a new payment history record
                await _unitOfWork.PaymentHistoryRepo.InsertAsync(paymentHistoryRequest);
            }
            else
            {
                // Try to find an existing payment history record and update it
                var existingPaymentHistory = await _unitOfWork.PaymentHistoryRepo
                    .GetByConditionAsync(w => w.RazorpayPaymentId == razorpayPaymentId)
                    .FirstOrDefaultAsync();

                if (existingPaymentHistory != null)
                {
                    // Update existing record with new values
                    paymentHistoryRequest.Adapt(existingPaymentHistory);

                    // Update the existing payment history record
                    _unitOfWork.PaymentHistoryRepo.Update(existingPaymentHistory);
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

            var receipt = webhookPayload["payload"]?["order"]?["entity"]?["receipt"]?.ToString();

            if (receipt == null || !int.TryParse(receipt, out var credit))
            {
                return;
            }

            // If no Razorpay Customer ID, fetch the billing detail using Razorpay Order ID
            var razorpayOrderId = paymentEntity?["order_id"]?.ToString();

            // Attempt to fetch the billing detail from the database based on the Razorpay Order ID
            var billingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.RazorpayOrderId == razorpayOrderId)
                .FirstOrDefaultAsync();

            if (billingDetail == null)
            {
                // Log a warning if the billing detail is missing or invalid
                _logger.LogWarning("Missing or invalid Razorpay Customer ID in the payload.");
                return;
            }

            billingDetail.PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true);
            billingDetail.RazorpayPaymentId = razorpayPaymentId;
            billingDetail.LastModifiedByUserId = billingDetail.LastModifiedByUserId;

            _unitOfWork.BillingDetailRepo.Update(billingDetail);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to update billing detail for Razorpay Payment ID: {RazorpayPaymentId}", razorpayPaymentId);
            }

            var tenantCredit = new TenantCredit()
            {
                AvailableCredits = credit,
                Type = CreditTypesEnum.TopUp,
                CreditedOn = DateTimeOffset.UtcNow,
                ExpiredOn = DateTimeOffset.UtcNow.AddYears(1).Date,
                SubscriptionId = billingDetail.SubscriptionId,
                TenantId = billingDetail.TenantId,
                CreatedByUserId = billingDetail.CreatedByUserId,
                LastModifiedByUserId = billingDetail.CreatedByUserId,
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
                 .GetByConditionAsync(s => s.RazorpaySubscriptionId == subscriptionId && s.IsActive)
                 .Include(i => i.Plan)
                 .FirstOrDefaultAsync();

            if (tenantSubscription == null)
            {
                _logger.LogWarning("Billing processing failed: Subscription with ID {SubscriptionId} not found in the system.", subscriptionId);
                return;
            }

            // Retrieve the most recent billing record for the tenant with valid contact and address details
            var billingRecordsQuery = _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == tenantSubscription.TenantId)
                .OrderByDescending(o => o.CreatedOn);

            var lastBillingDetail = await billingRecordsQuery
                .FirstOrDefaultAsync(w => w.ContactPerson != null && w.AddressLine1 != null);

            // Extract Razorpay Payment ID from the payment entity
            var razorpayPaymentId = paymentEntity["id"]?.ToString();

            // Check if a billing record already exists for this Razorpay payment and subscription
            var existingBillingDetail = await billingRecordsQuery
                .FirstOrDefaultAsync(w =>
                    w.TenantId == tenantSubscription.TenantId &&
                    w.SubscriptionId == tenantSubscription.Id &&
                    (w.RazorpayPaymentId == razorpayPaymentId || w.RazorpayPaymentId == null)
                );

            if (existingBillingDetail != null)
            {
                // Update the existing billing record if found
                _logger.LogInformation("Updating existing billing record for Razorpay Payment ID {RazorpayPaymentId}", razorpayPaymentId);

                existingBillingDetail.Amount = paymentEntity["amount"]?.ToObject<int?>() / 100 ?? 0;
                existingBillingDetail.InvoiceLink = invoiceLink;
                existingBillingDetail.RazorpayInvoiceId = paymentEntity["invoice_id"]?.ToObject<string?>() ?? string.Empty;
                existingBillingDetail.RazorpayOrderId = paymentEntity["order_id"]?.ToObject<string?>() ?? string.Empty;
                existingBillingDetail.PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true);
                existingBillingDetail.BillingEmail = paymentEntity["email"]?.ToObject<string?>() ?? string.Empty;
                existingBillingDetail.ContactPerson = paymentEntity["contact"]?.ToObject<string?>() ?? string.Empty;
                existingBillingDetail.LastModifiedByUserId = tenantSubscription.CreatedByUserId;

                // Save the updated billing record
                _unitOfWork.BillingDetailRepo.Update(existingBillingDetail);
            }
            else
            {
                // Create a new billing record if no existing record is found
                _logger.LogInformation("Creating new billing record for Razorpay Payment ID {RazorpayPaymentId}", razorpayPaymentId);

                var billingRecord = new BillingDetail
                {
                    SubscriptionId = tenantSubscription.Id,
                    Amount = paymentEntity["amount"]?.ToObject<int?>() / 100 ?? 0,
                    InvoiceLink = invoiceLink,
                    RazorpayInvoiceId = paymentEntity["invoice_id"]?.ToObject<string?>() ?? string.Empty,
                    RazorpayPaymentId = paymentEntity["id"]?.ToObject<string?>() ?? string.Empty,
                    RazorpayOrderId = paymentEntity["order_id"]?.ToObject<string?>() ?? string.Empty,
                    PaymentStatus = (PaymentStatusTypesEnum)Enum.Parse(typeof(PaymentStatusTypesEnum), paymentEntity["status"]?.ToString(), ignoreCase: true),
                    Currency = (CurrencyTypesEnum)Enum.Parse(typeof(CurrencyTypesEnum), paymentEntity["currency"]?.ToString(), ignoreCase: true),
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

                // Save the new billing record to the database
                await _unitOfWork.BillingDetailRepo.InsertAsync(billingRecord);
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
}