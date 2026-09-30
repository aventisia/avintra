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
        // var tz = TimeZoneInfo.FindSystemTimeZoneById(timezone);
        // var localTime = localTimeOfDay ?? new TimeOnly(0, 0);
        // var localDateTime = DateTime.SpecifyKind(DateTime.Today.Add(localTime.ToTimeSpan()), DateTimeKind.Unspecified);
        // var localOffset = new DateTimeOffset(localDateTime, tz.GetUtcOffset(localDateTime));
        // var utcTime = localOffset.ToUniversalTime();

        // Check if the provided time is already UTC (assumed from your note)
        // localTimeOfDay is already in UTC, no need to convert
        DateTime? utcDateTime = null;

        // If localTimeOfDay is not null, it is in UTC and we don't need to convert
        if (localTimeOfDay.HasValue)
            utcDateTime = DateTime.SpecifyKind(DateTime.Today.Add(localTimeOfDay.Value.ToTimeSpan()), DateTimeKind.Utc);
        else
            utcDateTime = DateTime.UtcNow;

        int utcHour = utcDateTime.Value.Hour;
        int utcMinute = utcDateTime.Value.Minute;

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

    // Computes the next valid trigger time in UTC based on the provided cron expression, excluding specific hours, weekdays, or dates if necessary
    public static DateTimeOffset ComputeNextTriggerUtc(
    string cronExpression,
    DateTimeOffset effectiveDate,
    IReadOnlyCollection<int>? excludedHours = null,
    IReadOnlyCollection<int>? excludedWeekdays = null,
    IReadOnlyCollection<DateOnly>? excludedDates = null,
    string timezone = "UTC")
    {
        // Ensure effectiveDate is not in the past
        effectiveDate = effectiveDate > DateTimeOffset.UtcNow ? effectiveDate : DateTimeOffset.UtcNow;

        // Resolve the trigger timezone once; fall back to UTC for unknown/invalid ids
        TimeZoneInfo tz;
        try
        {
            tz = TimeZoneInfo.FindSystemTimeZoneById(timezone);
        }
        catch (TimeZoneNotFoundException)
        {
            tz = TimeZoneInfo.Utc;
        }
        catch (InvalidTimeZoneException)
        {
            tz = TimeZoneInfo.Utc;
        }

        // Create a CronExpression object based on the provided cron expression
        var expr = new CronExpression(cronExpression);

        // Get the next valid time after the current UTC time
        DateTimeOffset? next = expr.GetNextValidTimeAfter(effectiveDate);

        // Loop up to 750 times to find the next valid time that does not match excluded criteria
        for (int i = 0; i < 750 && next != null; i++)
        {
            // Convert the candidate instant to the trigger timezone so exception
            // hours/weekdays/dates are evaluated against the user's local wall clock.
            var localNext = TimeZoneInfo.ConvertTime(next.Value, tz);

            // Convert the DateTime to DateOnly (removes time component)
            var nextDateOnly = DateOnly.FromDateTime(localNext.DateTime);

            // Get the day of the week (1 = Monday, 7 = Sunday)
            int weekday = (int)localNext.DayOfWeek;

            // Normalize Sunday to 7 to match convention (1 = Monday, 7 = Sunday)
            if (weekday == 0) weekday = 7;

            // Get the hour of the day (0-23)
            int hour = localNext.Hour;

            // Check if the computed time should be excluded (either hour, weekday, or date)
            if (!((excludedHours?.Contains(hour) ?? false) ||
                (excludedWeekdays?.Contains(weekday) ?? false) ||
                (excludedDates?.Contains(nextDateOnly) ?? false)))
            {
                // If the time is valid (not excluded), return it
                return next.Value;
            }

            // If the time is excluded, move to the next occurrence (add one hour)
            next = expr.GetNextValidTimeAfter(next.Value.AddHours(1));
        }

        // If no valid next occurrence was found after 500 checks, throw an exception
        return next?.ToUniversalTime() ?? throw new InvalidOperationException("Could not find a valid next occurrence.");
    }


    // Builds a description of a time trigger schedule.
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