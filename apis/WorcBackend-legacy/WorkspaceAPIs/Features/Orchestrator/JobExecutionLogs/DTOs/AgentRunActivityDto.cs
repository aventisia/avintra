namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Summarizes an agent's runs across all of its versions over a window of local days.
/// </summary>
public class AgentRunActivityDto
{
    /// <summary>
    /// Gets or sets the number of runs started in the window.
    /// </summary>
    public int TotalRuns { get; set; }

    /// <summary>
    /// Gets or sets the number of runs that completed successfully in the window.
    /// </summary>
    public int SucceededRuns { get; set; }

    /// <summary>
    /// Gets or sets the number of runs that failed, aborted, or were killed in the window.
    /// </summary>
    public int FailedRuns { get; set; }

    /// <summary>
    /// Gets or sets the average duration in seconds of completed runs, or null when none completed.
    /// </summary>
    public double? AverageDurationSeconds { get; set; }

    /// <summary>
    /// Gets or sets the per-day run counts, oldest day first, ending on the current local day.
    /// </summary>
    public List<AgentRunActivityDayDto> Days { get; set; } = [];
}
