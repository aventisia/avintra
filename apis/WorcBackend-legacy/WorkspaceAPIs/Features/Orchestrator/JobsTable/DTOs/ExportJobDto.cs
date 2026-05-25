namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Defines the filter criteria for exporting job data based on various parameters such as priority, status, machine IDs, agent IDs, and date range.
/// </summary>
public class ExportJobRequestDto
{
    /// <summary>
    /// Gets or sets the priority level of the job (e.g., Normal, High).
    /// </summary>
    public JobPriorityTypesEnum? Priority { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public JobStatusTypesEnum? Status { get; set; }

    /// <summary>
    /// Gets or sets the list of machine IDs to include in the exported job data.
    /// </summary>
    public List<Guid>? MachineIds { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of agent IDs to filter the job data.
    /// </summary>
    public List<Guid> AgentIds { get; set; } = new();

    /// <summary>
    /// Gets or sets the start date for filtering jobs based on their execution time.
    /// </summary>
    public DateTimeOffset? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date for filtering jobs based on their execution time.
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }
}

/// <summary>
/// Represents a record of credit usage, including details such as service type, credit consumption, associated job, and execution status.
/// </summary>
public class ExportJobResponseDto
{
    /// <summary>
    /// Gets or sets the name of the flow or agent associated with the job.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the trigger type for the job (e.g., manual, API, event-based).
    /// </summary>
    public string? TriggerType { get; set; }

    /// <summary>
    /// Gets or sets the priority level of the job (e.g., Normal, High).
    /// </summary>
    public string? Priority { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the job execution started.
    /// </summary>
    public DateTimeOffset? StartTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the job execution finished. This is null if the job is still in progress.
    /// </summary>
    public DateTimeOffset? EndTime { get; set; }

    /// <summary>
    /// Calculates and gets the job execution duration in seconds, as the difference between StartTime and EndTime. 
    /// Returns 0 if the job is still running.
    /// </summary>
    public double Duration
    {
        get
        {
            if (StartTime.HasValue && EndTime.HasValue)
                return (EndTime.Value - StartTime.Value).TotalSeconds;
            return 0;
        }
    }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the machine where the job is being executed.
    /// </summary>
    public string? MachineName { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }
}
