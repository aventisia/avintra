using Quartz;

namespace AspNetToolkit.Utils;

public static class CronScheduleUtil
{
    private const int MaxOccurrenceSearchAttempts = 750;

    /// <summary>
    /// Builds a Quartz-compatible CRON expression for the supplied frequency; the time of day
    /// defaults to midnight when not provided.
    /// </summary>
    public static string BuildCronExpression(
        TriggerFrequencyTypesEnum frequencyType,
        int interval,
        TimeOnly? timeOfDay = null,
        IReadOnlyCollection<int>? weekdays = null,
        IReadOnlyCollection<int>? monthDays = null,
        bool isLastWorkingDay = false)
    {
        var scheduledTime = timeOfDay ?? new TimeOnly(0, 0);
        int hour = scheduledTime.Hour;
        int minute = scheduledTime.Minute;

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

        return frequencyType switch
        {
            TriggerFrequencyTypesEnum.MinuteByMinute =>
                $"0 0/{interval} * * * ? *",

            TriggerFrequencyTypesEnum.Hourly =>
                $"0 {minute} 0/{interval} * * ? *",

            TriggerFrequencyTypesEnum.Daily =>
                $"0 {minute} {hour} 1/{interval} * ? *",

            TriggerFrequencyTypesEnum.Weekly =>
                $"0 {minute} {hour} ? * {weekdayPart} *",

            TriggerFrequencyTypesEnum.MonthlyDayOfMonth =>
                isLastWorkingDay
                    ? $"0 {minute} {hour} LW 1/{interval} ? *"
                    : $"0 {minute} {hour} {string.Join(",", monthDays ?? new List<int> { 1 })} 1/{interval} ? *",

            TriggerFrequencyTypesEnum.MonthlyDayOfWeek =>
                $"0 {minute} {hour} ? 1/{interval} {weekdayPart} *",

            _ => throw new ArgumentOutOfRangeException(nameof(frequencyType))
        };
    }

    /// <summary>
    /// Computes the next trigger time in UTC for the supplied CRON expression, honouring the
    /// timezone used for the schedule and the optional hour, weekday, and date exclusions.
    /// </summary>
    public static DateTimeOffset ComputeNextTriggerUtc(
        string cronExpression,
        DateTimeOffset effectiveDate,
        IReadOnlyCollection<int>? excludedHours = null,
        IReadOnlyCollection<int>? excludedWeekdays = null,
        IReadOnlyCollection<DateOnly>? excludedDates = null,
        string timezone = "UTC")
    {
        effectiveDate = effectiveDate > DateTimeOffset.UtcNow ? effectiveDate : DateTimeOffset.UtcNow;

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

        var expr = new CronExpression(cronExpression) { TimeZone = tz };
        DateTimeOffset? next = expr.GetNextValidTimeAfter(effectiveDate);

        for (int i = 0; i < MaxOccurrenceSearchAttempts && next != null; i++)
        {
            var localNext = TimeZoneInfo.ConvertTime(next.Value, tz);
            var nextDateOnly = DateOnly.FromDateTime(localNext.DateTime);
            int weekday = (int)localNext.DayOfWeek;
            if (weekday == 0) weekday = 7;

            int hour = localNext.Hour;

            if (!((excludedHours?.Contains(hour) ?? false) ||
                (excludedWeekdays?.Contains(weekday) ?? false) ||
                (excludedDates?.Contains(nextDateOnly) ?? false)))
            {
                return next.Value.ToUniversalTime();
            }

            next = expr.GetNextValidTimeAfter(next.Value.AddHours(1));
        }

        return next?.ToUniversalTime() ?? throw new InvalidOperationException("Could not find a valid next occurrence.");
    }

    /// <summary>
    /// Builds a human-readable description of a time-trigger schedule.
    /// </summary>
    public static string BuildDescription(
        TriggerFrequencyTypesEnum frequencyType,
        int interval,
        string timezone,
        TimeOnly? timeOfDay = null,
        IReadOnlyCollection<int>? weekdays = null,
        IReadOnlyCollection<int>? monthDays = null)
    {
        string plural(int count) => count > 1 ? "s" : string.Empty;

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

        string time = timeOfDay?.ToString("HH:mm") ?? "00:00";

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
