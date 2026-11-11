namespace GlobalAdminAPIs.DTOs;

/// <summary>
/// Represents the statistics of an on-premises instance, including execution times, user count, agent count, and job executions.
/// </summary>
public class OnpremInstanceStaticDto
{
    /// <summary>
    /// Gets or sets the total execution time consumed (in milliseconds) by the instance.
    /// </summary>
    public double TotalExecutionTimeConsumed { get; set; }

    /// <summary>
    /// Gets or sets the total number of users in the on-premises instance.
    /// </summary>
    public int TotalUsers { get; set; }

    /// <summary>
    /// Gets or sets the total number of published agents in the instance.
    /// </summary>
    public int TotalPublishedAgents { get; set; }

    /// <summary>
    /// Gets or sets the total number of executed jobs in the instance.
    /// </summary>
    public long TotalExecutedJobs { get; set; }
}
