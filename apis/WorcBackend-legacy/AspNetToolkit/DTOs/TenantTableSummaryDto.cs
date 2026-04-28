namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents a summarized view of job-related metrics for a specific tenant.
/// Includes total execution time and publish agent count within a given period.
/// </summary>
public class TenantTableSummaryDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the tenant.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the total number of publish agents (or published flows/jobs)
    /// associated with the tenant.
    /// </summary>
    public int PublishAgent { get; set; }

    /// <summary>
    /// Gets or sets the total execution time (or consumed credits, depending on usage)
    /// for all jobs under the tenant within the specified date range.
    /// </summary>
    public double ExecutionTime { get; set; }
}