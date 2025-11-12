using Cronos;

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
            TriggerFrequencyTypesEnum.MinuteByMinute =>
                $"0 0/{interval} * * *",

            TriggerFrequencyTypesEnum.Hourly =>
            $"{utcMinute} {utcHour}/{interval} * * *",

            TriggerFrequencyTypesEnum.Daily =>
                $"0 {utcMinute} {utcHour} */{interval} * {weekdayPart} *",

            TriggerFrequencyTypesEnum.Weekly =>
                $"0 {utcMinute} {utcHour} ? * {weekdayPart} *",

            TriggerFrequencyTypesEnum.Monthly =>
                isLastWorkingDay
                    ? $"0 {utcMinute} {utcHour} LW 1/{interval} ? *"
                    : $"0 {utcMinute} {utcHour} {monthDays?.FirstOrDefault() ?? 1} 1/{interval} {weekdayPart} *",

            // TriggerFrequencyTypesEnum.Monthly =>
            //     $"0 {utcMinute} {utcHour} ? 1/{interval} {weekdayPart} *",

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
        var expr = CronExpression.Parse(cronExpression);

        // Get the current time in UTC
        DateTime currentDateTime = DateTime.UtcNow;

        // Get the next occurrence in the timezone (starting from now)
        DateTime? next = expr.GetNextOccurrence(currentDateTime);

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
            next = expr.GetNextOccurrence(currentDateTime.AddMinutes(1));
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
            TriggerFrequencyTypesEnum.Monthly =>
                $"Every {interval} month{plural(interval)} on {formatWeekdays(weekdays)} at {time} ({timezone})",

            _ => "Custom schedule"
        };
    }
}