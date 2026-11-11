namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Provides the shared JSON options, schedule rebuild, and scheduler lock key for <see cref="TimeTriggerModel"/> metadata.
/// </summary>
public static class TimeTriggerMetadataHelpers
{
    /// <summary>
    /// Advisory lock key that serializes scheduler ticks and schedule corrections.
    /// </summary>
    public const string ExecutionLockKey = "time-trigger-execution";

    /// <summary>
    /// Gets the serializer options shared by every time-trigger metadata reader and writer.
    /// </summary>
    public static JsonSerializerOptions JsonOptions { get; } = CreateJsonOptions();

    /// <summary>
    /// Rebuilds the cron expression and the next trigger time in the trigger's timezone.
    /// </summary>
    public static void RebuildSchedule(TimeTriggerModel model, string timezone)
    {
        model.CronExpression = CronScheduleUtil.BuildCronExpression(
            model.Frequency,
            model.Interval,
            model.AtTime,
            model.Weekdays,
            model.MonthDays);

        model.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
            model.CronExpression,
            model.EffectiveDate,
            model.ExceptionHours,
            model.ExceptionWeekdays,
            model.ExceptionDates,
            timezone);
    }

    /// <summary>
    /// Rebuilds a future schedule in the trigger's timezone; a due one is left for the scheduler to fire.
    /// </summary>
    /// <returns>True when the trigger's metadata was rewritten.</returns>
    public static bool CorrectSchedule(Trigger trigger)
    {
        var model = System.Text.Json.JsonSerializer.Deserialize<TimeTriggerModel>(trigger.Metadata.RootElement.GetRawText(), JsonOptions)
            ?? throw new System.Text.Json.JsonException("Time trigger metadata is null.");

        if (model.NextTriggerTime <= DateTimeOffset.UtcNow)
            return false;

        var storedCron = model.CronExpression;
        var storedNextTriggerTime = model.NextTriggerTime;
        RebuildSchedule(model, trigger.Timezone);

        if (model.CronExpression == storedCron && model.NextTriggerTime == storedNextTriggerTime)
            return false;

        trigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(model, JsonOptions));
        return true;
    }

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        options.Converters.Add(new JsonStringEnumConverter());
        return options;
    }
}
