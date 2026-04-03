namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Request body for firing a webhook trigger (POST /webhook/{triggerId}).
/// </summary>
public class WebhookFireRequestDto
{
    /// <summary>
    /// Gets or sets the optional payload to pass as input arguments to the agent.
    /// Will be validated against the trigger's ExpectedPayloadSchema if one is configured.
    /// </summary>
    public JsonElement? Payload { get; set; }
}

/// <summary>
/// Response returned after successfully firing a webhook trigger.
/// </summary>
public class WebhookFireResponseDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the created job.
    /// </summary>
    public Guid JobId { get; set; }

    /// <summary>
    /// Gets or sets the initial status of the created job.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the URL the external app can use to poll for job status.
    /// </summary>
    public string PollingUrl { get; set; } = string.Empty;
}

/// <summary>
/// Response returned when polling for job execution status (GET /webhook/job/{jobId}).
/// </summary>
public class WebhookJobStatusDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the job.
    /// </summary>
    public Guid JobId { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Created, Running, Completed, Failed).
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the timestamp when the job execution started.
    /// </summary>
    public DateTimeOffset? StartTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the job execution completed.
    /// </summary>
    public DateTimeOffset? EndTime { get; set; }

    /// <summary>
    /// Gets or sets the input arguments that were passed when the job was created.
    /// </summary>
    public string? InputArgumentsJson { get; set; }

    /// <summary>
    /// Gets or sets the output data produced by the agent. Populated only when the job is completed.
    /// </summary>
    public string? OutputDataJson { get; set; }
}
