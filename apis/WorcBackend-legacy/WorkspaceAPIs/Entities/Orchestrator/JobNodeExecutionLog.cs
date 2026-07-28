namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a single node execution log entry for a job.
/// Stores per-node execution metadata and compressed input/output JSON payloads in isolation from the main job record.
/// </summary>
[Table("ws_JobNodeExecutionLogs")]
public class JobNodeExecutionLog
{
    /// <summary>
    /// Gets or sets the unique identifier for the log entry.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the job identifier this log entry belongs to.
    /// </summary>
    public Guid JobId { get; set; }

    /// <summary>
    /// Gets or sets the tenant identifier for multi-tenant filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for this specific execution instance of the node.
    /// </summary>
    public string NodeExecutionId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the retry attempt number for the node execution.
    /// </summary>
    public int RetryAttempt { get; set; }

    /// <summary>
    /// Gets or sets the node identifier within the ReactFlow graph.
    /// </summary>
    public string NodeId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name of the node.
    /// </summary>
    public string NodeDisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the unique name of the node.
    /// </summary>
    public string NodeUniqueName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether the node execution succeeded.
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// Gets or sets the duration of the node execution in seconds.
    /// </summary>
    public double Duration { get; set; }

    /// <summary>
    /// Gets or sets the Brotli-compressed JSON representation of the node inputs.
    /// </summary>
    public byte[]? InputsJsonCompressed { get; set; }

    /// <summary>
    /// Gets or sets the Brotli-compressed JSON representation of the node outputs.
    /// </summary>
    public byte[]? OutputsJsonCompressed { get; set; }

    /// <summary>
    /// Gets or sets the uncompressed length of the inputs JSON for observability and size tracking.
    /// </summary>
    public int? InputsJsonLength { get; set; }

    /// <summary>
    /// Gets or sets the uncompressed length of the outputs JSON for observability and size tracking.
    /// </summary>
    public int? OutputsJsonLength { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the node execution occurred.
    /// </summary>
    public DateTimeOffset ExecutedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the parent job navigation property.
    /// </summary>
    [ForeignKey("JobId")]
    public virtual Job Job { get; set; } = null!;
}
