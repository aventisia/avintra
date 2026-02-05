namespace AccountsAPIs.Jobs;

public class TenantCreditAllocationJob : IJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TenantCreditAllocationJob> _logger;

    public TenantCreditAllocationJob(IUnitOfWork unitOfWork, ILogger<TenantCreditAllocationJob> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // Main method for Quartz job execution
    public async Task Execute(IJobExecutionContext context)
    {
        // Get the current UTC time to record the start and end times of the job
        var currentDateTime = DateTimeOffset.UtcNow;

        // Log that the job has started
        _logger.LogInformation($"Tenant credit update job started at {currentDateTime:O}");

        try
        {
            // Retrieve tenant subscriptions that are due for credit allocation today
            var tenantSubscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.Plan.Type == SubscriptionPlanTypeEnum.Starter &&
                    w.IsActive &&
                    w.NextBillingDate.Date <= currentDateTime.Date)
                .Include(i => i.Plan)
                .ToListAsync();

            // Log how many subscriptions are due for processing
            _logger.LogInformation($"Found {tenantSubscriptions.Count} subscriptions for credit allocation today.");

            var tenantCredits = new List<TenantCredit>();

            // Loop through each subscription to create tenant credits and update NextBillingDate
            foreach (var subscription in tenantSubscriptions)
            {
                // Update the NextBillingDate by adding 1 month to it
                subscription.NextBillingDate = subscription.NextBillingDate.AddMonths(1);
                subscription.LastModifiedByUserId = subscription.LastModifiedByUserId;

                _unitOfWork.TenantSubscriptionRepo.Update(subscription);

                // Create a new TenantCredit for the subscription
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

                // Add the created tenant credit to the list
                tenantCredits.Add(tenantCredit);
            }

            // Check if there are any credits to insert
            if (tenantCredits.Any())
            {
                _logger.LogInformation($"Inserting {tenantCredits.Count} credits into the system.");

                // Insert the tenant credits into the database
                await _unitOfWork.TenantCreditRepo.InsertAsync(tenantCredits);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save tenant credit updates to the database.");
                }
            }

            _logger.LogInformation($"Tenant credit update job completed successfully at {currentDateTime:O}");
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the job execution
            _logger.LogError(ex, "An error occurred while processing the tenant credit update job.");
        }
    }
}