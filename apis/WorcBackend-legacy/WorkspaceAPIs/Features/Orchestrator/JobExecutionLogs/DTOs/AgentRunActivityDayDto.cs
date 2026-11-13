namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Run counts for one local day of an agent's activity.
/// </summary>
public class AgentRunActivityDayDto
{
    /// <summary>
    /// Gets or sets the local calendar day the runs started on.
    /// </summary>
    public DateOnly Date { get; set; }

    /// <summary>
    /// Gets or sets the number of runs started on this day.
    /// </summary>
    public int Runs { get; set; }

    /// <summary>
    /// Gets or sets the number of runs on this day that completed successfully.
    /// </summary>
    public int Succeeded { get; set; }

    /// <summary>
    /// Gets or sets the number of runs on this day that failed, aborted, or were killed.
    /// </summary>
    public int Failed { get; set; }
}
