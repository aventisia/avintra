using Quartz;

namespace AspNetToolkit.Utils;

public static class CronScheduleUtil
{
    // Builds a Quartz-compatible CRON expression string based on the trigger parameters.
    public static string BuildCronExpression(
    TriggerFrequencyTypesEnum frequencyType,
    int interval,
    string timezone,
    TimeOnly? localTimeOfDay = null,
    IReadOnlyCollection<int>? weekdays = null,
    IReadOnlyCollection<int>? monthDays = null,
    bool isLastWorkingDay = false)
    {
        // Convert local time → UTC
        var tz = TimeZoneInfo.FindSystemTimeZoneById(timezone);
        var localTime = localTimeOfDay ?? new TimeOnly(0, 0);
        var localDateTime = DateTime.SpecifyKind(DateTime.Today.Add(localTime.ToTimeSpan()), DateTimeKind.Unspecified);
        var localOffset = new DateTimeOffset(localDateTime, tz.GetUtcOffset(localDateTime));
        var utcTime = localOffset.ToUniversalTime();

        int utcHour = utcTime.Hour;
        int utcMinute = utcTime.Minute;

        // Convert weekdays (1=MON ... 7=SUN) → CRON format
        string weekdayPart = "*";
        if (weekdays != null && weekdays.Count > 0)
        {
            weekdayPart = string.Join(",", weekdays.Select(day => day switch
            {
                1 => "MON",
                2 => "TUE",
                3 => "WED",
                4 => "THU",
                5 => "FRI",
                6 => "SAT",
                7 => "SUN",
                _ => "*"
            }));
        }

        // Build CRON based on frequency type
        return frequencyType switch
        {
            // Every N minutes
            TriggerFrequencyTypesEnum.MinuteByMinute =>
                $"0 0/{interval} * * * ? *", // e.g. every 5 minutes → 0 0/5 * * * ? *

            // Every N hours at specific minute
            TriggerFrequencyTypesEnum.Hourly =>
                $"0 {utcMinute} 0/{interval} * * ? *", // e.g. every 2 hours at 15 → 0 15 0/2 * * ? *

            // Every N days at specific time (UTC)
            TriggerFrequencyTypesEnum.Daily =>
                $"0 {utcMinute} {utcHour} 1/{interval} * ? *", // e.g. every day 14:30 UTC → 0 30 14 1/1 * ? *

            // Every week on given weekdays at specific time
            TriggerFrequencyTypesEnum.Weekly =>
                $"0 {utcMinute} {utcHour} ? * {weekdayPart} *", // e.g. MON,WED,FRI at 10:00 UTC → 0 0 10 ? * MON,WED,FRI *

            // Every N months, on specific day or last working day
            TriggerFrequencyTypesEnum.MonthlyDayOfMonth =>
                isLastWorkingDay
                    ? $"0 {utcMinute} {utcHour} LW 1/{interval} ? *" // e.g. last working day every month 18:00 UTC
                    : $"0 {utcMinute} {utcHour} {string.Join(",", monthDays ?? new List<int> { 1 })} 1/{interval} ? *",
            // e.g. day 1, 15 every 2 months at 9:00 UTC

            // Every N months on specific weekday (like first Monday)
            TriggerFrequencyTypesEnum.MonthlyDayOfWeek =>
                $"0 {utcMinute} {utcHour} ? 1/{interval} {weekdayPart} *", // e.g. 1st Monday every 2 months → 0 0 9 ? 1/2 MON *

            _ => throw new ArgumentOutOfRangeException(nameof(frequencyType))
        };
    }

    public static DateTimeOffset ComputeNextTriggerUtc(
    string cronExpression,
    IReadOnlyCollection<int>? excludedHours = null,
    IReadOnlyCollection<int>? excludedWeekdays = null,
    IReadOnlyCollection<DateOnly>? excludedDates = null)
    {
        // Parse the cron expression (this assumes the cron expression doesn't include seconds)
        var expr = new CronExpression(cronExpression);

        // Get the current time in UTC
        DateTimeOffset currentDateTime = DateTimeOffset.UtcNow;

        // Get the next occurrence in the timezone (starting from now)
        DateTimeOffset? next = expr.GetNextValidTimeAfter(currentDateTime);

        // Loop to find a valid next occurrence that is not excluded
        for (int i = 0; i < 500 && next != null; i++)
        {
            // Get the weekday (with Sunday as 7)
            int weekday = currentDateTime.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)currentDateTime.DayOfWeek;
            int hour = currentDateTime.Hour;
            var date = DateOnly.FromDateTime(currentDateTime.Date);

            // Check if this occurrence is excluded
            bool isExcluded =
                (excludedHours?.Contains(hour) ?? false) ||
                (excludedWeekdays?.Contains(weekday) ?? false) ||
                (excludedDates?.Contains(date) ?? false);

            if (!isExcluded)
            {
                // If it's not excluded, return the UTC time
                return next.Value.ToUniversalTime();
            }

            // Skip to the next potential occurrence by adding 1 minute to the current local time
            next = expr.GetNextValidTimeAfter(currentDateTime.AddMinutes(1));
        }

        // Return the next valid occurrence in UTC if found, otherwise return the last computed value
        return next?.ToUniversalTime() ?? throw new InvalidOperationException("Could not find a valid next occurrence.");
    }

    // Builds a human-readable description of a time trigger schedule.
    public static string BuildDescription(
        TriggerFrequencyTypesEnum frequencyType,
        int interval,
        string timezone,
        TimeOnly? timeOfDay = null,
        IReadOnlyCollection<int>? weekdays = null,
        IReadOnlyCollection<int>? monthDays = null)
    {
        // Helper method to handle pluralization (e.g., "minute" vs "minutes").
        string plural(int count) => count > 1 ? "s" : string.Empty;

        // Helper method to format weekdays into a readable string (e.g., "Monday, Wednesday").
        string formatWeekdays(IReadOnlyCollection<int>? days)
        {
            if (days == null || days.Count == 0) return "unspecified days";

            return string.Join(", ", days.Select(d => d switch
            {
                1 => "Monday",
                2 => "Tuesday",
                3 => "Wednesday",
                4 => "Thursday",
                5 => "Friday",
                6 => "Saturday",
                7 => "Sunday",
                _ => "InvalidDay"
            }));
        }

        // Format the provided timeOfDay or default to "00:00" if not provided.
        string time = timeOfDay?.ToString("HH:mm") ?? "00:00";

        // Switch statement to return a description based on the frequency type.
        return frequencyType switch
        {
            TriggerFrequencyTypesEnum.MinuteByMinute =>
                $"Every {interval} minute{plural(interval)}",
            TriggerFrequencyTypesEnum.Hourly =>
                $"Every {interval} hour{plural(interval)} at minute {timeOfDay?.Minute ?? 0:D2} ({timezone})",
            TriggerFrequencyTypesEnum.Daily =>
                $"Every {interval} day{plural(interval)} at {time} ({timezone})",
            TriggerFrequencyTypesEnum.Weekly =>
                $"Every week on {formatWeekdays(weekdays)} at {time} ({timezone})",
            TriggerFrequencyTypesEnum.MonthlyDayOfMonth =>
                $"Every {interval} month{(interval > 1 ? "s" : "")} on day(s) {string.Join(", ", monthDays ?? new List<int> { 1 })} at {time} ({timezone})",
            TriggerFrequencyTypesEnum.MonthlyDayOfWeek =>
                $"Every {interval} month{(interval > 1 ? "s" : "")} on {formatWeekdays(weekdays)} at {time} ({timezone})",

            _ => "Custom schedule"
        };
    }
}