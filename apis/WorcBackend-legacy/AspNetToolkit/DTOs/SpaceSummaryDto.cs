namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents an aggregate summary of usage metrics for a single space.
/// This is used to populate the aggregate columns (published agents, execution time,
/// machines attached) in the Tenant Admin Spaces table.
/// </summary>
public class SpaceSummaryDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the space.
    /// Null indicates the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the total number of published agents in the space.
    /// </summary>
    public int TotalPublishedAgents { get; set; }

    /// <summary>
    /// Gets or sets the total execution time (in seconds) for all completed jobs in the space.
    /// </summary>
    public double TotalExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the total number of machines attached to the space.
    /// </summary>
    public int TotalMachinesAttached { get; set; }
}
