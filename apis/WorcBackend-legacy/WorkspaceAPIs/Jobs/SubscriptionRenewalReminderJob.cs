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
        private readonly ILogger<SubscriptionRenewalReminderJob> _logger;

        public SubscriptionRenewalReminderJob(
            TenantDbContext tenantDbContext,
            INotificationEventService notificationEventService,
            ILogger<SubscriptionRenewalReminderJob> logger)
        {
            _tenantDbContext = tenantDbContext;
            _notificationEventService = notificationEventService;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            var currentDateTime = DateTimeOffset.UtcNow;
            _logger.LogInformation("Subscription renewal reminder job started at {Time:O}.", currentDateTime);

            try
            {
                // Active subscriptions whose next billing date is today or later. Per-tenant
                // reminder windows (SubscriptionRenewalReminderDays) can differ, so the window
                // filter is applied per tenant after loading the notification settings.
                var subscriptions = await _tenantDbContext.ReadOnlyTenantSubscriptions
                    .Where(s => s.IsActive
                        && s.NextBillingDate.Date >= currentDateTime.Date)
                    .Select(s => new { s.TenantId, s.NextBillingDate })
                    .ToListAsync();

                if (subscriptions.Count == 0)
                {
                    _logger.LogInformation("No subscriptions due for renewal within the reminder window.");
                    return;
                }

                // Load the per-tenant notification settings in a single pass.
                var tenantIds = subscriptions.Select(s => s.TenantId).Distinct().ToList();
                var settingsByTenant = await _tenantDbContext.ReadOnlyTenants
                    .Where(t => tenantIds.Contains(t.Id))
                    .Select(t => new { t.Id, t.NotificationSettings })
                    .ToDictionaryAsync(t => t.Id, t => t.NotificationSettings);

                foreach (var subscription in subscriptions)
                {
                    // Use the tenant's stored reminder window; fall back to the model default
                    // (7) when no settings are stored. The value is always greater than zero.
                    var reminderWindowDays = settingsByTenant.TryGetValue(subscription.TenantId, out var settings)
                        ? settings?.SubscriptionRenewalReminderDays
                            ?? new NotificationSettings().SubscriptionRenewalReminderDays
                        : new NotificationSettings().SubscriptionRenewalReminderDays;

                    var reminderStartDate = currentDateTime.Date.AddDays(reminderWindowDays);

                    // Only remind when the next billing date is within [today, start of window].
                    if (subscription.NextBillingDate.Date > reminderStartDate)
                    {
                        _logger.LogInformation("Tenant {TenantId} subscription renewal on {NextBillingDate:O} is outside the {Days} day reminder window; skipping.",
                            subscription.TenantId, subscription.NextBillingDate, reminderWindowDays);
                        continue;
                    }

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
