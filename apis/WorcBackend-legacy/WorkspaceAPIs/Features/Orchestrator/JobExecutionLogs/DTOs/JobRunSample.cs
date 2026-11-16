namespace WorkspaceAPIs.DTOs;

/// <summary>
/// The fields of a job needed to build an agent's run activity, read without loading payloads.
/// </summary>
/// <param name="CreatedOn">The time the job record was created, which is when the run started.</param>
/// <param name="Status">The current status of the job.</param>
/// <param name="StartTime">The time execution started, or null if it never started.</param>
/// <param name="EndTime">The time execution ended, or null if it is still in progress.</param>
public record JobRunSample(
    DateTimeOffset CreatedOn,
    JobStatusEnum Status,
    DateTimeOffset? StartTime,
    DateTimeOffset? EndTime);
