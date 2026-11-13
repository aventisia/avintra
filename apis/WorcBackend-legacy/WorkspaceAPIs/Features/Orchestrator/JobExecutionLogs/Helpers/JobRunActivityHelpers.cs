using AspNetToolkit.Enums;
using WorkspaceAPIs.DTOs;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Builds an agent's run activity from job samples, bucketed by the caller's local calendar days.
/// </summary>
public static class JobRunActivityHelpers
{
    private const int MaxDays = 90;
    private const int MaxUtcOffsetMinutes = 840;

    private static readonly JobStatusEnum[] FailedStatuses = [JobStatusEnum.Failed, JobStatusEnum.Aborted, JobStatusEnum.Killed];

    /// <summary>
    /// Clamps the requested window length to a supported range.
    /// </summary>
    public static int ClampDays(int days) => Math.Clamp(days, 1, MaxDays);

    /// <summary>
    /// Clamps the caller's UTC offset to the range of real time zones.
    /// </summary>
    public static int ClampUtcOffsetMinutes(int utcOffsetMinutes) =>
        Math.Clamp(utcOffsetMinutes, -MaxUtcOffsetMinutes, MaxUtcOffsetMinutes);

    /// <summary>
    /// Returns the instant at the start of the first local day in the window.
    /// </summary>
    public static DateTimeOffset GetWindowStart(int days, int utcOffsetMinutes)
    {
        var offset = TimeSpan.FromMinutes(utcOffsetMinutes);
        var firstLocalDay = GetFirstLocalDay(days, utcOffsetMinutes);
        return new DateTimeOffset(firstLocalDay.ToDateTime(TimeOnly.MinValue), offset);
    }

    /// <summary>
    /// Builds the activity summary for the given job samples over the window.
    /// </summary>
    public static AgentRunActivityDto Build(IEnumerable<JobRunSample> jobs, int days, int utcOffsetMinutes)
    {
        var offset = TimeSpan.FromMinutes(utcOffsetMinutes);
        var firstLocalDay = GetFirstLocalDay(days, utcOffsetMinutes);
        var activity = new AgentRunActivityDto
        {
            Days = Enumerable.Range(0, days)
                .Select(index => new AgentRunActivityDayDto { Date = firstLocalDay.AddDays(index) })
                .ToList(),
        };
        var completedDurations = new List<double>();

        foreach (var job in jobs)
        {
            var localDay = DateOnly.FromDateTime(job.CreatedOn.ToOffset(offset).DateTime);
            var index = localDay.DayNumber - firstLocalDay.DayNumber;
            if (index < 0 || index >= days) continue;

            var bucket = activity.Days[index];
            bucket.Runs++;
            activity.TotalRuns++;

            if (FailedStatuses.Contains(job.Status))
            {
                bucket.Failed++;
                activity.FailedRuns++;
            }

            if (job.Status == JobStatusEnum.Completed)
            {
                bucket.Succeeded++;
                activity.SucceededRuns++;
                if (job.StartTime.HasValue && job.EndTime.HasValue)
                    completedDurations.Add((job.EndTime.Value - job.StartTime.Value).TotalSeconds);
            }
        }

        if (completedDurations.Count > 0)
            activity.AverageDurationSeconds = completedDurations.Average();

        return activity;
    }

    private static DateOnly GetFirstLocalDay(int days, int utcOffsetMinutes)
    {
        var localNow = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromMinutes(utcOffsetMinutes));
        return DateOnly.FromDateTime(localNow.DateTime).AddDays(-(days - 1));
    }
}
