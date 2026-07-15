namespace WorkspaceAPIs.DTOs;

/// <summary>
/// DTO for exporting jobs data request. This DTO contains optional filters such as list of job priorities, list of job statuses etc. to filter the job data.
/// </summary>
public class ExportJobsReqDto
{
    /// <summary>
    /// Gets or sets the start date for filtering jobs based on their execution time.
    /// </summary>
    public DateTimeOffset? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date for filtering jobs based on their execution time.
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }

    /// <summary>
    /// Gets or sets the status types of the jobs to be included in the export (e.g., Pending, Running, Completed, Failed).
    /// </summary>
    public List<JobStatusEnum>? Statuses { get; set; }

    /// <summary>
    /// Gets or sets the list of FlowVersion IDs to filter the job data.
    /// </summary>
    public List<Guid>? FlowVersionIds { get; set; }

    /// <summary>
    /// Gets or sets the list of trigger types to filter the job data. 
    /// </summary>
    public List<TriggerTypesEnum>? TriggerTypes { get; set; }

    /// <summary>
    /// Gets or sets the list of ExecutionLocations (machine/agent builder/web server etc.) to filter the job data. 
    /// </summary>
    public List<string>? ExecutionLocations { get; set; }

    /// <summary>
    /// Gets or sets whether to retrieve jobs data of published flow versions
    /// </summary>
    public bool IncludePublishedFlows { get; set; } = true;

    /// <summary>
    /// Gets or sets whether to retrieve jobs data of unpublished flow versions
    /// </summary>
    public bool IncludeUnpublishedFlows { get; set; } = true;

    /// <summary>
    /// Gets or sets the types of flows to filter the job data. 
    /// </summary>
    public List<FlowTypesEnum>? FlowTypes { get; set; }

    /// <summary>
    /// Gets or sets the priority levels of the jobs to be included in the export (e.g., High, Medium, Low).
    /// </summary>
    public List<JobPriorityEnum>? Priorities { get; set; }
}