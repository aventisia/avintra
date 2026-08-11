using AspNetToolkit.Config;
using AspNetToolkit.Data;
using AspNetToolkit.Entities;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Jobs
{
    /// <summary>
    /// A background job that sends daily renewal reminders to the Tenant Admin
    /// when a subscription's next billing date is approaching. Reminders stop
    /// automatically once the subscription is renewed (NextBillingDate advances
    /// or the subscription is no longer active).
    /// </summary>
    public class SubscriptionRenewalReminderJob : IJob
    {
        private readonly TenantDbContext _tenantDbContext;
        private readonly INotificationEventService _notificationEventService;
        private readonly EnvironmentConfig _environmentConfig;
        private readonly ILogger<SubscriptionRenewalReminderJob> _logger;

        public SubscriptionRenewalReminderJob(
            TenantDbContext tenantDbContext,
            INotificationEventService notificationEventService,
            EnvironmentConfig environmentConfig,
            ILogger<SubscriptionRenewalReminderJob> logger)
        {
            _tenantDbContext = tenantDbContext;
            _notificationEventService = notificationEventService;
            _environmentConfig = environmentConfig;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            var currentDateTime = DateTimeOffset.UtcNow;
            var reminderWindowDays = _environmentConfig.SubscriptionRenewalReminderDays;
            var reminderStartDate = currentDateTime.Date.AddDays(reminderWindowDays);
            _logger.LogInformation("Subscription renewal reminder job started at {Time:O}.", currentDateTime);

            try
            {
                // Active subscriptions whose next billing date falls within the reminder window
                var subscriptions = await _tenantDbContext.ReadOnlyTenantSubscriptions
                    .Where(s => s.IsActive
                        && s.NextBillingDate.Date >= currentDateTime.Date
                        && s.NextBillingDate.Date <= reminderStartDate)
                    .Select(s => new { s.TenantId, s.NextBillingDate })
                    .ToListAsync();

                if (subscriptions.Count == 0)
                {
                    _logger.LogInformation("No subscriptions due for renewal within the reminder window.");
                    return;
                }

                foreach (var subscription in subscriptions)
                {
                    _logger.LogInformation("Sending renewal reminder for tenant {TenantId} with next billing date {NextBillingDate:O}.",
                        subscription.TenantId, subscription.NextBillingDate);

                    await _notificationEventService.NotifySubscriptionRenewalAsync(subscription.TenantId, subscription.NextBillingDate);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while running subscription renewal reminder job.");
            }
        }
    }
}
