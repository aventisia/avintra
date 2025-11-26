namespace AccountsAPIs.Jobs;

public class TenantHistoryCleanupJob : IJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TenantHistoryCleanupJob> _logger;

    public TenantHistoryCleanupJob(IUnitOfWork unitOfWork, ILogger<TenantHistoryCleanupJob> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // Main method for Quartz job execution
    public async Task Execute(IJobExecutionContext context)
    {
        var currentDateTime = DateTimeOffset.UtcNow;

        // Log job start with timestamp
        _logger.LogInformation($"Tenant credit history retention job started at {currentDateTime:O}.");

        try
        {
            // Retrieve active tenant subscriptions that have a retention policy
            var tenantSubscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.IsActive)
                .ToListAsync();

            _logger.LogInformation($"Found {tenantSubscriptions.Count} active tenant subscriptions to process for retention cleanup.");

            foreach (var tenantSubscription in tenantSubscriptions)
            {
                // Calculate the retention date based on the subscription's retention policy (HistoryRetentionDays)
                var retentionDate = currentDateTime.AddDays(-tenantSubscription.HistoryRetentionDays).Date;

                // Log the retention date for this tenant and the retention period
                _logger.LogInformation($"Processing Tenant ID {tenantSubscription.TenantId}: Retention Period is {tenantSubscription.HistoryRetentionDays} days, Retention Date is {retentionDate:O}.");

                // TODO: Implement the logic to process and clean up tenant credit history records
                // Ensure the following:
                // - Retrieve tenant credit history records older than the retention date.
                // - Delete or archive records that are no longer needed.
                // - Ensure related entities are handled (cascade delete, soft delete, etc.).
                // - Log actions taken, including successes and failures.
                // - Handle performance optimizations if large data sets are involved.

                // Retrieve tenant credit history records where the CreatedOn date is older than or equal to the retention date
                var oldTenantCredits = await _unitOfWork.TenantCreditRepo
                    .GetByConditionAsync(w => w.TenantId == tenantSubscription.TenantId && w.CreatedOn < retentionDate)
                    .ToListAsync();

                // Log how many records are found for deletion
                if (oldTenantCredits.Any())
                {
                    _logger.LogInformation($"Found {oldTenantCredits.Count} tenant credit history records for Tenant ID {tenantSubscription.TenantId} that are older than the retention date {retentionDate:O}.");

                    // // Delete old records from the database
                    // _unitOfWork.TenantCreditRepo.Delete(oldTenantCredits);

                    // // Attempt to save changes to the database
                    // if (!await _unitOfWork.SaveAsync())
                    // {
                    //     _logger.LogWarning($"Failed to delete tenant credit history records for Tenant ID {tenantSubscription.TenantId}. Changes were not saved.");
                    // }
                }
            }

            // Log the successful completion of the job
            _logger.LogInformation($"Tenant credit history retention job completed successfully at {currentDateTime:O}");
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the job execution
            _logger.LogError(ex, "An error occurred while processing the tenant credit history retention job.");
        }
    }
}
