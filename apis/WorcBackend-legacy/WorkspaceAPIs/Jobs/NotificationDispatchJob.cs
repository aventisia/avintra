using AspNetToolkit.Data;
using AspNetToolkit.Enums;
using AspNetToolkit.Services;
using AspNetToolkit.Utils;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Jobs
{
    /// <summary>
    /// A background job that dispatches scheduled notifications whose due time has arrived.
    /// For recurring notifications, it computes the next occurrence and keeps them scheduled
    /// until the recurrence end date is reached.
    /// </summary>
    public class NotificationDispatchJob : IJob
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly TenantDbContext _tenantDbContext;
        private readonly ILogger<NotificationDispatchJob> _logger;

        public NotificationDispatchJob(
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            TenantDbContext tenantDbContext,
            ILogger<NotificationDispatchJob> logger)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _tenantDbContext = tenantDbContext;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            var now = DateTimeOffset.UtcNow;
            _logger.LogInformation("Notification dispatch job started at {Time:O}.", now);

            try
            {
                // Find all scheduled notifications whose due time has arrived (across all tenants)
                var dueNotifications = await _unitOfWork.NotificationRepo
                    .GetByConditionAsync(w => w.Status == NotificationStatusEnum.Scheduled &&
                                              w.ScheduledFor.HasValue &&
                                              w.ScheduledFor.Value <= now)
                    .IgnoreQueryFilters()
                    .ToListAsync();

                if (dueNotifications.Count == 0)
                {
                    _logger.LogInformation("No scheduled notifications due for dispatch.");
                    return;
                }

                _logger.LogInformation("Dispatching {Count} scheduled notification(s).", dueNotifications.Count);

                foreach (var notification in dueNotifications)
                {
                    // Send email for Email/Both delivery channels on this dispatch occurrence.
                    await SendNotificationEmailAsync(notification);

                    // If the notification is recurring, compute the next occurrence
                    if (notification.RecurrenceFrequency.HasValue &&
                        notification.RecurrenceFrequency.Value != NotificationRecurrenceEnum.None)
                    {
                        var nextScheduledFor = ComputeNextOccurrence(notification, now);

                        // If there is a next occurrence within the recurrence end date, keep it scheduled
                        if (nextScheduledFor.HasValue &&
                            (!notification.RecurrenceEndOn.HasValue || nextScheduledFor.Value <= notification.RecurrenceEndOn.Value))
                        {
                            notification.ScheduledFor = nextScheduledFor.Value;
                            notification.Status = NotificationStatusEnum.Scheduled;
                            notification.SentOn = now;
                            _unitOfWork.NotificationRepo.Update(notification);
                            continue;
                        }

                        // Recurrence has ended: mark as sent (final dispatch)
                        notification.Status = NotificationStatusEnum.Sent;
                        notification.SentOn = now;
                        _unitOfWork.NotificationRepo.Update(notification);
                        continue;
                    }

                    // One-time scheduled notification: dispatch and mark as sent
                    notification.Status = NotificationStatusEnum.Sent;
                    notification.SentOn = now;
                    _unitOfWork.NotificationRepo.Update(notification);
                }

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save changes while dispatching scheduled notifications.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while dispatching scheduled notifications.");
            }
        }

        // Computes the next occurrence time for a recurring notification.
        private DateTimeOffset? ComputeNextOccurrence(Notification notification, DateTimeOffset now)
        {
            var frequency = notification.RecurrenceFrequency ?? NotificationRecurrenceEnum.None;
            var interval = notification.RecurrenceInterval ?? 1;

            // Map the notification recurrence to the trigger frequency used by CronScheduleUtil
            var triggerFrequency = frequency switch
            {
                NotificationRecurrenceEnum.Daily => TriggerFrequencyTypesEnum.Daily,
                NotificationRecurrenceEnum.Weekly => TriggerFrequencyTypesEnum.Weekly,
                NotificationRecurrenceEnum.Monthly => TriggerFrequencyTypesEnum.MonthlyDayOfMonth,
                _ => TriggerFrequencyTypesEnum.Daily
            };

            var weekdays = ParseIntList(notification.RecurrenceWeekdays);
            var monthDays = ParseIntList(notification.RecurrenceMonthDays);

            // Use the notification's scheduled time-of-day (UTC) for the recurrence
            var scheduledTime = notification.ScheduledFor ?? now;
            var localTimeOfDay = new TimeOnly(scheduledTime.Hour, scheduledTime.Minute);

            string cronExpression;
            try
            {
                cronExpression = CronScheduleUtil.BuildCronExpression(
                    triggerFrequency,
                    interval,
                    "UTC",
                    localTimeOfDay,
                    weekdays,
                    monthDays);
            }
            catch (Exception ex)
            {
                // Fall back to a simple daily recurrence if the cron cannot be built
                _logger.LogError(ex, "Failed to build cron expression for recurring notification {Id}.", notification.Id);
                cronExpression = CronScheduleUtil.BuildCronExpression(
                    TriggerFrequencyTypesEnum.Daily,
                    1,
                    "UTC",
                    localTimeOfDay);
            }

            return CronScheduleUtil.ComputeNextTriggerUtc(cronExpression, now);
        }

        // Parses a JSON-serialized list of integers (null-safe).
        private static List<int>? ParseIntList(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return null;
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<int>>(json);
            }
            catch
            {
                return null;
            }
        }

        // Sends a notification email for Email/Both delivery channels. Resolves recipient
        // user IDs from the NotificationUser rows and their email addresses from the
        // AccountsDb read-only projection. No-op for Platform-only notifications.
        private async Task SendNotificationEmailAsync(Notification notification)
        {
            if (notification.DeliveryChannel != DeliveryChannelEnum.Email &&
                notification.DeliveryChannel != DeliveryChannelEnum.Both)
            {
                return;
            }

            try
            {
                // Resolve recipient user IDs from the NotificationUser rows (across all tenants).
                var userIds = await _unitOfWork.NotificationUserRepo
                    .GetByConditionAsync(w => w.NotificationId == notification.Id)
                    .IgnoreQueryFilters()
                    .Select(w => w.UserId)
                    .Distinct()
                    .ToListAsync();

                if (userIds.Count == 0)
                {
                    _logger.LogWarning("No recipients found for email dispatch of notification {Id}.", notification.Id);
                    return;
                }

                var emails = await _tenantDbContext.ReadOnlyAccountUsers
                    .Where(u => userIds.Contains(u.Id) && !string.IsNullOrWhiteSpace(u.Email))
                    .Select(u => u.Email!)
                    .Distinct()
                    .ToListAsync();

                if (emails.Count == 0)
                {
                    _logger.LogWarning("No email addresses resolved for notification {Id}.", notification.Id);
                    return;
                }

                var toEmailAddresses = string.Join(",", emails);
                var subject = string.IsNullOrWhiteSpace(notification.Title) ? "Notification" : notification.Title;
                var content = notification.Message;

                var sent = await _emailService.SendEmail(toEmailAddresses, subject, content);
                if (sent)
                {
                    _logger.LogInformation("Notification email sent for {Id} to {Recipients}.", notification.Id, toEmailAddresses);
                }
                else
                {
                    _logger.LogError("Failed to send notification email for {Id} to {Recipients}.", notification.Id, toEmailAddresses);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification email for {Id}.", notification.Id);
            }
        }
    }
}
