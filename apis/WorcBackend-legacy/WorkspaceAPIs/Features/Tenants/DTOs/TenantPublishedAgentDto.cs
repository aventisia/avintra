namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a published agent (flow version) belonging to a specific tenant,
/// along with its usage metrics for the Super Admin tenants view.
/// </summary>
public class TenantPublishedAgentDto
{
    /// <summary>
    /// Gets or sets the flow version (agent) ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the flow ID the version belongs to.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the name of the agent (flow).
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the agent was published.
    /// </summary>
    public DateTimeOffset PublishedOn { get; set; }

    /// <summary>
    /// Gets or sets the daily average credits consumed by this agent within the last 30 days.
    /// </summary>
    public double DailyAverageCredits { get; set; }

    /// <summary>
    /// Gets or sets the daily average runtime (in seconds) of this agent within the last 30 days.
    /// </summary>
    public double DailyAverageRuntime { get; set; }

    /// <summary>
    /// Gets or sets the fixed credits limit configured for this agent, if any.
    /// </summary>
    public double? FixedCredits { get; set; }
}
