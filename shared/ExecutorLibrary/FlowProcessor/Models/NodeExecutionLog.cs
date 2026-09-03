namespace ExecutorLibrary.FlowProcessor.Models;

public class NodeExecutionLog
{
    [JsonPropertyName("nodeId")]
    public string NodeId { get; set; } = string.Empty;

    [JsonPropertyName("nodeName")]
    public string NodeName { get; set; } = string.Empty;

    [JsonPropertyName("nodeUniqueName")]
    public string NodeUniqueName { get; set; } = string.Empty;

    [JsonPropertyName("isSuccess")]
    public bool IsSuccess { get; set; }

    [JsonPropertyName("duration")]
    public double Duration { get; set; }

    /// <summary>
    /// UTC timestamp captured on the executor the moment the node finished. Set by
    /// FlowProcessor at log creation; the backend falls back to insert time when absent.
    /// Preserves true execution order across batched log uploads.
    /// </summary>
    [JsonPropertyName("executedAt")]
    public DateTimeOffset ExecutedAt { get; set; }

    /// <summary>
    /// A unique identifier for this specific execution instance of the node.
    /// Distinguishes repeated executions of the same node (e.g. inside a loop).
    /// </summary>
    [JsonPropertyName("uniqueNodeId")]
    public string UniqueNodeId { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("inputs")]
    public Dictionary<string, string> Inputs { get; set; } = new();

    [JsonPropertyName("outputs")]
    public Dictionary<string, string> Outputs { get; set; } = new();
}
