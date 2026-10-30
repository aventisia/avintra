namespace GlobalAdminAPIs.DTOs;

/// <summary>
/// Represents a request to validate an on-prem instance.
/// </summary>
public class OnPremInstanceRequestDto
{
    /// <summary>
    /// Gets or sets the platform version of the instance (e.g., "2.4.1").
    /// </summary>
    public required string PlatformVersion { get; set; }

    /// <summary>
    /// Gets or sets the service that validated the instance (e.g., BackgroundService or StartUpService).
    /// </summary>
    public required string Source { get; set; }

    /// <summary>
    /// Gets or sets the usage metrics for the last 7 days for the on-prem instance.
    /// </summary>
    public required List<ProjectUsageMetricDto> Last7DayUsages { get; set; }
}

/// <summary>
/// Represents the usage metrics for an on-prem instance.
/// </summary>
public class ProjectUsageMetricDto
{
    /// <summary>
    /// Gets or sets the date of the usage metric (e.g., "2023-01-01").
    /// </summary>
    public DateTimeOffset Date { get; set; }

    /// <summary>
    /// Gets or sets the number of jobs executed on the instance.
    /// </summary>
    public int JobsExecuted { get; set; }

    /// <summary>
    /// Gets or sets the total execution time (in seconds) of all jobs.
    /// </summary>
    public double TotalExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the number of users interacting with the instance.
    /// </summary>
    public int Users { get; set; }

    /// <summary>
    /// Gets or sets the number of published agents on the instance.
    /// </summary>
    public int PublishedAgents { get; set; }
}
