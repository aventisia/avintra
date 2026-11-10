using System.Text.Json;
using AspNetToolkit.Enums;
using WorkspaceAPIs.DTOs;
using WorkspaceAPIs.Entities;
using WorkspaceAPIs.Helpers;

namespace ExecutorLibrary.Tests.TimeTriggers;

/// <summary>
/// Regression harness for <see cref="TimeTriggerMetadataHelpers.CorrectSchedule"/>.
/// </summary>
public static class TimeTriggerScheduleCorrectionTestHarness
{
    private static readonly DateTimeOffset FutureEffectiveDate = new(2099, 1, 1, 0, 0, 0, TimeSpan.Zero);

    public static int Run()
    {
        var failures = 0;

        failures += Run("StaleFutureRowMovesToTriggerTimezone", () =>
        {
            var trigger = DailyEightAmKolkata(FutureEffectiveDate, new DateTimeOffset(2099, 1, 1, 8, 0, 0, TimeSpan.Zero));

            AssertEqual(true, TimeTriggerMetadataHelpers.CorrectSchedule(trigger));
            AssertEqual(new DateTimeOffset(2099, 1, 1, 2, 30, 0, TimeSpan.Zero), NextTriggerTime(trigger));
        });

        failures += Run("HealthyRowIsLeftAlone", () =>
        {
            var trigger = DailyEightAmKolkata(FutureEffectiveDate, new DateTimeOffset(2099, 1, 1, 2, 30, 0, TimeSpan.Zero));

            AssertEqual(false, TimeTriggerMetadataHelpers.CorrectSchedule(trigger));
        });

        failures += Run("DueRowIsLeftForTheScheduler", () =>
        {
            var dueAt = new DateTimeOffset(2000, 1, 1, 8, 0, 0, TimeSpan.Zero);
            var trigger = DailyEightAmKolkata(dueAt.AddHours(-8), dueAt);

            AssertEqual(false, TimeTriggerMetadataHelpers.CorrectSchedule(trigger));
            AssertEqual(dueAt, NextTriggerTime(trigger));
        });

        return failures;
    }

    private static Trigger DailyEightAmKolkata(DateTimeOffset effectiveDate, DateTimeOffset storedNextTriggerTime)
    {
        var model = new TimeTriggerModel
        {
            Frequency = TriggerFrequencyTypesEnum.Daily,
            AtTime = new TimeOnly(8, 0),
            CronExpression = "0 0 8 1/1 * ? *",
            EffectiveDate = effectiveDate,
            NextTriggerTime = storedNextTriggerTime,
        };

        return new Trigger
        {
            Name = "daily-8am",
            Timezone = "Asia/Kolkata",
            Metadata = JsonDocument.Parse(JsonSerializer.Serialize(model, TimeTriggerMetadataHelpers.JsonOptions)),
        };
    }

    private static DateTimeOffset NextTriggerTime(Trigger trigger) =>
        trigger.Metadata.RootElement.Deserialize<TimeTriggerModel>(TimeTriggerMetadataHelpers.JsonOptions)!.NextTriggerTime;

    private static int Run(string name, Action test)
    {
        try
        {
            test();
            Console.WriteLine($"  PASS: {name}");
            return 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"  FAIL: {name}");
            Console.WriteLine($"        {ex.Message}");
            return 1;
        }
    }

    private static void AssertEqual(object? expected, object? actual)
    {
        if (!Equals(expected, actual))
            throw new InvalidOperationException($"Expected '{expected}', got '{actual}'.");
    }
}
