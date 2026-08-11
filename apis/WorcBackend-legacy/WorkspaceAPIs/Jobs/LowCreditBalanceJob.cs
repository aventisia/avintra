using AspNetToolkit.Config;
using AspNetToolkit.Data;
using AspNetToolkit.Entities;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Jobs
{
    /// <summary>
    /// A background job that checks each tenant's available credit balance and
    /// notifies the Tenant Admin when it falls below the configured threshold.
    /// </summary>
    public class LowCreditBalanceJob : IJob
    {
        private readonly TenantDbContext _tenantDbContext;
        private readonly INotificationEventService _notificationEventService;
        private readonly EnvironmentConfig _environmentConfig;
        private readonly ILogger<LowCreditBalanceJob> _logger;

        public LowCreditBalanceJob(
            TenantDbContext tenantDbContext,
            INotificationEventService notificationEventService,
            EnvironmentConfig environmentConfig,
            ILogger<LowCreditBalanceJob> logger)
        {
            _tenantDbContext = tenantDbContext;
            _notificationEventService = notificationEventService;
            _environmentConfig = environmentConfig;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            var currentDateTime = DateTimeOffset.UtcNow;
            var threshold = _environmentConfig.LowCreditThreshold;
            _logger.LogInformation("Low credit balance job started at {Time:O}.", currentDateTime);

            try
            {
                // Enumerate all enabled tenants
                var tenants = await _tenantDbContext.ReadOnlyTenants
                    .Where(w => !w.IsDisabled)
                    .Select(s => new { s.Id, s.Name })
                    .ToListAsync();

                if (tenants.Count == 0)
                {
                    _logger.LogInformation("No enabled tenants found for low credit check.");
                    return;
                }

                // Sum available (non-expired) credits per tenant
                var creditTotals = await _tenantDbContext.ReadOnlyTenantCredits
                    .Where(c => c.ExpiredOn.Date > currentDateTime.Date)
                    .GroupBy(g => g.TenantId)
                    .Select(s => new { TenantId = s.Key, Total = s.Sum(x => x.AvailableCredits) })
                    .ToListAsync();

                var creditByTenant = creditTotals.ToDictionary(d => d.TenantId, d => d.Total);

                foreach (var tenant in tenants)
                {
                    var availableCredits = creditByTenant.TryGetValue(tenant.Id, out var total) ? total : 0;

                    if (availableCredits < threshold)
                    {
                        _logger.LogInformation("Tenant {TenantId} ({TenantName}) has low credit: {Credits:N0} below threshold {Threshold:N0}.",
                            tenant.Id, tenant.Name, availableCredits, threshold);

                        await _notificationEventService.NotifyLowCreditAsync(tenant.Id, availableCredits, threshold);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while running low credit balance job.");
            }
        }
    }
}
