namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a single node execution log entry for API exchange.
/// Mirrors the shared ExecutorLibrary.FlowProcessor.Models.NodeExecutionLog shape.
/// </summary>
public class NodeExecutionLogDto
{
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
    /// Gets or sets the UTC timestamp captured by the executor when the node finished.
    /// Null on legacy payloads; the server falls back to insert time.
    /// </summary>
    public DateTimeOffset? ExecutedAt { get; set; }

    /// <summary>
    /// Gets or sets the node input values as key/value pairs.
    /// </summary>
    public Dictionary<string, string> Inputs { get; set; } = new();

    /// <summary>
    /// Gets or sets the node output values as key/value pairs.
    /// </summary>
    public Dictionary<string, string> Outputs { get; set; } = new();
}
