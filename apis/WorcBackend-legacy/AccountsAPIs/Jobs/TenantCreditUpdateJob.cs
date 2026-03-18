namespace AccountsAPIs.Jobs;

public class TenantCreditAllocationJob : IJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TenantCreditAllocationJob> _logger;
    private readonly IEmailService _emailService;
    private readonly EnvironmentConfig _environmentConfig;
    // Declare the constant at the class level
    private const string ACCOUNT_EMAIL = "accounts@aventisia.com";

    public TenantCreditAllocationJob(IUnitOfWork unitOfWork, ILogger<TenantCreditAllocationJob> logger, IEmailService emailService, EnvironmentConfig environmentConfig)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _emailService = emailService;
        _environmentConfig = environmentConfig;
    }

    // Main Quartz job execution method
    public async Task Execute(IJobExecutionContext context)
    {
        // Capture the current UTC time for consistent processing
        var currentDateTime = DateTimeOffset.UtcNow.Date;

        _logger.LogInformation($"Tenant credit update job started at {currentDateTime:O}");

        try
        {
            // Define date range
            var startDate = currentDateTime.Date.AddDays(-1); // past 1 day
            var endDate = currentDateTime.Date.AddDays(8);    // next 8 days

            // Fetch subscriptions within the range
            var tenantSubscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.IsActive &&
                    w.NextBillingDate.Date >= startDate &&
                    w.NextBillingDate.Date <= endDate)
                .Include(x => x.Plan)
                .Include(x => x.BillingDetails)
                .AsNoTracking()
                .ToListAsync();

            _logger.LogInformation($"Found {tenantSubscriptions.Count} active subscriptions.");

            // List to store credits that need to be inserted
            var tenantCredits = new List<TenantCredit>();

            // Loop through each subscription
            foreach (var subscription in tenantSubscriptions)
            {
                // STARTER PLAN LOGIC: Allocate monthly credits when billing date is due
                if (subscription.Plan.Type == SubscriptionPlanTypeEnum.Starter &&
                    subscription.NextBillingDate.Date <= currentDateTime)
                {
                    // If billing date is older than 1 month (job might have missed runs) reset it to current time to avoid multiple backdated credits
                    if (subscription.NextBillingDate < currentDateTime.AddMonths(-1))
                    {
                        subscription.NextBillingDate = currentDateTime;
                    }

                    // Move the billing cycle forward by 1 month
                    subscription.NextBillingDate = subscription.NextBillingDate.AddMonths(1);

                    // Update the subscription record
                    _unitOfWork.TenantSubscriptionRepo.Update(subscription);

                    // Create a new credit record for the tenant
                    var tenantCredit = new TenantCredit()
                    {
                        TenantId = subscription.TenantId,
                        AvailableCredits = subscription.MaxCredits,
                        CreditedOn = currentDateTime,
                        ExpiredOn = subscription.NextBillingDate.Date,
                        Type = CreditTypesEnum.Subscription,
                        SubscriptionId = subscription.Id,
                        CreatedByUserId = subscription.CreatedByUserId,
                        LastModifiedByUserId = subscription.LastModifiedByUserId
                    };

                    // Add to batch insert list
                    tenantCredits.Add(tenantCredit);
                }

                // PRO PLAN LOGIC: Send reminder emails before subscription expiry
                else if (subscription.Plan.Type == SubscriptionPlanTypeEnum.Pro)
                {
                    // Get the subscription expiry date
                    var expiryDate = subscription.NextBillingDate.Date;

                    // Calculate how many days remain until the subscription expires
                    var daysRemaining = (expiryDate - currentDateTime).Days;

                    // Get the most recent billing details for the subscription
                    var billingDetail = subscription.BillingDetails
                        .OrderByDescending(o => o.CreatedOn)
                        .FirstOrDefault();

                    // If no billing details exist, log and skip processing this subscription
                    if (billingDetail == null)
                    {
                        _logger.LogWarning(
                            "Tenant {TenantId}: No billing details found for SubscriptionId {SubscriptionId}. Skipping processing.",
                            subscription.TenantId,
                            subscription.Id);
                        continue;
                    }

                    // Reference to the subscription plan
                    var plan = subscription.Plan;

                    // Variable to determine which email template will be used
                    EmailTypesEnum emailType;

                    // Calculate billing amount If the billing country is India, include 18% GST
                    decimal amount = subscription.Plan.Price;

                    if (billingDetail.Country == CountriesEnum.India)
                    {
                        // Add 18% GST and round to 2 decimal places
                        amount = Math.Round(amount * 1.18m, 2);
                    }

                    var defaultUrl = "https://worc.aventisia.com/worc/tenant";

                    var allowedHosts = new[]
                    {
                        "dev-worc.aventisia.com",
                        "uat-worc.aventisia.com",
                        "worc.aventisia.com"
                    };

                    string billingUrl = defaultUrl;

                    if (Uri.TryCreate(_environmentConfig.AccountsApiBaseUrl, UriKind.Absolute, out var baseUri)
                        && allowedHosts.Contains(baseUri.Host))
                    {
                        // Build URL using only scheme + host (ignore any existing path)
                        billingUrl = $"{baseUri.Scheme}://{baseUri.Host}/worc/tenant";
                    }

                    // Initialize placeholders for the email template. These will be replaced in the email body dynamically
                    var placeholderValues = new Dictionary<string, string>
                    {
                        { "{{UserName}}", billingDetail.ContactPerson },
                        { "{{Amount}}", $"{subscription.Plan.Currency} {amount}" },
                        { "{{PlanName}}", plan.Name },
                        { "{{BillingFrequency}}", subscription.Frequency.ToString() },
                        { "{{ExpiryDate}}", $"{subscription.NextBillingDate:MMM dd, yyyy · hh:mm tt} - UTC" },
                        { "{{BillingUrl}}", $"{billingUrl}"}
                    };

                    // Send reminder email if the subscription will expire within the next 1–5 days
                    if (new[] { 0, 1, 3, 5 }.Contains(daysRemaining))
                    {
                        // Select the email template used for subscription expiry reminders
                        emailType = EmailTypesEnum.SubscriptionExpiryReminder;

                        // Add the number of days remaining until expiry. This value will be used in the email template placeholder {{DaysLeft}}
                        placeholderValues.Add("{{DaysLeft}}", daysRemaining.ToString());

                        // Send reminder email to the billing contact CC the accounts team for tracking or support purposes
                        await _emailService.SendEmailUsingTemplate(
                            emailType: emailType,
                            toEmailAddress: billingDetail.BillingEmail,
                            placeholderValues: placeholderValues,
                            ccEmailAddresses: ACCOUNT_EMAIL
                        );
                    }

                    // Send notification email if the subscription expired **yesterday**
                    // This ensures that only tenants whose subscriptions expired exactly one day ago
                    // receive the expiration email, avoiding repeated notifications for older expired subscriptions
                    else if (expiryDate == currentDateTime.AddDays(-1).Date)
                    {
                        // Select the email template used for expired subscriptions
                        emailType = EmailTypesEnum.SubscriptionExpired;

                        // Send expiration notification email This informs the customer that their subscription has expired and they may need to renew or reactivate it
                        await _emailService.SendEmailUsingTemplate(
                            emailType: emailType,
                            toEmailAddress: billingDetail.BillingEmail,
                            placeholderValues: placeholderValues,
                            ccEmailAddresses: ACCOUNT_EMAIL
                        );
                    }
                }
            }

            // SAVE CREDIT RECORDS
            if (tenantCredits.Any())
            {
                _logger.LogInformation($"Inserting {tenantCredits.Count} tenant credits.");

                // Bulk insert generated credits
                await _unitOfWork.TenantCreditRepo.InsertAsync(tenantCredits);

                // Save database changes
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save tenant credit updates.");
                }
            }

            _logger.LogInformation($"Tenant credit update job completed successfully at {currentDateTime:O}");
        }
        catch (Exception ex)
        {
            // Log any unexpected errors
            _logger.LogError(ex, "An error occurred while processing the tenant credit update job.");
        }
    }
}