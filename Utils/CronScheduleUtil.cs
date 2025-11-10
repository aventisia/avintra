namespace AspNetToolkit.Utils;

public static class CronScheduleUtil
{
    // Computes the next scheduled occurrence in UTC, given a cron expression and timezone.
    public static DateTimeOffset ComputeNextTriggerUtc(string cronExpression, string timezone)
    {
        // Retrieve the timezone information for the specified timezone.
        var tz = TimeZoneInfo.FindSystemTimeZoneById(timezone);

        // Parse the cron expression into a Cronos.CronExpression object.
        var cron = Cronos.CronExpression.Parse(cronExpression, Cronos.CronFormat.IncludeSeconds);

        // Get the next occurrence in the cron expression's timezone relative to the current UTC time.
        var nextUtc = cron.GetNextOccurrence(DateTime.UtcNow);

        // If no next occurrence is found, throw an exception.
        if (!nextUtc.HasValue)
            throw new InvalidOperationException("Unable to find the next occurrence for the given cron expression.");

        // Ensure the next occurrence has the correct kind (DateTimeKind.Utc)
        var nextUtcValue = nextUtc.Value;
        if (nextUtcValue.Kind != DateTimeKind.Utc)
        {
            nextUtcValue = DateTime.SpecifyKind(nextUtcValue, DateTimeKind.Utc);
        }

        // Return the UTC time as a DateTimeOffset
        return new DateTimeOffset(nextUtcValue);
    }


    // Determines whether the given UTC time should be excluded based on provided parameters.
    public static bool IsExcluded(
        string timezone,
        IReadOnlyCollection<int>? excludedHours,
        IReadOnlyCollection<int>? excludedWeekdays,
        IReadOnlyCollection<DateOnly>? excludedDates,
        DateTimeOffset candidateTimeUtc)
    {
        // Ensure that the timezone is provided and not empty.
        if (string.IsNullOrWhiteSpace(timezone))
            throw new ArgumentException("Timezone cannot be null or empty.", nameof(timezone));

        // Convert the provided UTC candidate time into the local time based on the timezone.
        var tz = TimeZoneInfo.FindSystemTimeZoneById(timezone);
        var local = TimeZoneInfo.ConvertTime(candidateTimeUtc, tz);

        // Check if the candidate's day of the week is in the excluded weekdays list.
        if (excludedWeekdays != null && excludedWeekdays.Count > 0)
        {
            // Convert DayOfWeek enum to custom value (Sunday = 7, etc.).
            int localDay = local.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)local.DayOfWeek;

            // If the local day is in the excluded weekdays, return true (exclude).
            if (excludedWeekdays.Contains(localDay))
                return true;
        }

        // Check if the candidate's hour is in the excluded hours list.
        if (excludedHours != null && excludedHours.Count > 0 && excludedHours.Contains(local.Hour))
            return true;

        // Check if the candidate's date is in the excluded dates list.
        if (excludedDates != null && excludedDates.Count > 0)
        {
            // Convert the local date to DateOnly format for comparison.
            var localDate = DateOnly.FromDateTime(local.Date);

            // If the local date is in the excluded dates, return true (exclude).
            if (excludedDates.Contains(localDate))
                return true;
        }

        // If no exclusion conditions are met, return false (not excluded).
        return false;
    }

    // Builds a human-readable description of a time trigger schedule.
    public static string BuildHumanDescription(
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

    // Builds a Quartz-compatible CRON expression string based on the trigger parameters.
    public static string BuildCronExpression(
    TriggerFrequencyTypesEnum frequencyType,
    int interval,
    string timezone,
    TimeOnly? timeOfDay = null,
    IReadOnlyCollection<int>? weekdays = null,
    IReadOnlyCollection<int>? monthDays = null)
    {
        // Convert timeOfDay to TimeSpan (defaults to 00:00 if not provided)
        var time = timeOfDay?.ToTimeSpan() ?? TimeSpan.Zero;

        // Retrieve the time zone information for the given timezone
        var timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timezone);

        // Create a DateTime for the specified time (with DateTimeKind.Unspecified because we're working with local time)
        DateTime localTime = new DateTime(1, 1, 1, time.Hours, time.Minutes, 0, DateTimeKind.Unspecified);

        // Create a DateTimeOffset with the local time and the correct time zone offset
        DateTimeOffset localDateTimeWithOffset = new DateTimeOffset(localTime, timeZoneInfo.GetUtcOffset(localTime));

        // Convert the time to UTC
        DateTime utcTime = localDateTimeWithOffset.UtcDateTime;

        // Switch statement to build the appropriate cron expression based on the frequency type
        return frequencyType switch
        {
            TriggerFrequencyTypesEnum.MinuteByMinute =>
                // Cron expression for every x minutes
                $"0/{interval} * * * *",

            TriggerFrequencyTypesEnum.Hourly =>
                // Cron expression for every x hours at a specific minute
                $"0 {utcTime.Minute} */{interval} * * *",

            TriggerFrequencyTypesEnum.Daily =>
                // Cron expression for daily, at a specific time of day (hour and minute)
                $"0 {utcTime.Minute} {utcTime.Hour} */{interval} * *",

            TriggerFrequencyTypesEnum.Weekly =>
                // Cron expression for weekly, at a specific time and specific weekdays
                weekdays == null || weekdays.Count == 0
                    ? throw new ArgumentException("Weekdays must be provided for weekly schedules.")
                    : $"0 {utcTime.Minute} {utcTime.Hour} * * {string.Join(",", weekdays)}",

            TriggerFrequencyTypesEnum.Monthly =>
                // Cron expression for monthly, at specific days and time
                monthDays == null || monthDays.Count == 0
                    ? throw new ArgumentException("Month days must be provided for monthly schedules.")
                    : $"0 {utcTime.Minute} {utcTime.Hour} {string.Join(",", monthDays)} * *",

            _ => throw new ArgumentOutOfRangeException(nameof(frequencyType), frequencyType, "Unsupported trigger frequency type.")
        };
    }

    // Helper method to map integer weekday values (1 = Monday ... 7 = Sunday) to Quartz cron text (MON...SUN).
    private static string MapToCronDayOfWeek(int weekday) => weekday switch
    {
        1 => "MON", // Monday
        2 => "TUE", // Tuesday
        3 => "WED", // Wednesday
        4 => "THU", // Thursday
        5 => "FRI", // Friday
        6 => "SAT", // Saturday
        7 => "SUN", // Sunday
        _ => throw new ArgumentOutOfRangeException(nameof(weekday), "Weekday must be 1 (Monday) through 7 (Sunday).")
    };
}