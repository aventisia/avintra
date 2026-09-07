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
    /// <summary>
    /// Gets or sets the id of the parent-flow node (callAgentNode/blockNode) that invoked the
    /// sub-flow this node belongs to. Empty for nodes in the top-level flow that are not called
    /// by another node. Enables tracing which caller spawned each log across nested sub-flows.
    /// </summary>
    [JsonPropertyName("callerReferenceId")]
    public string CallerReferenceId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the id of the innermost active loop (forLoopNode) that contained this node
    /// at execution time. Empty when the node did not run inside any loop.
    /// </summary>
    [JsonPropertyName("loopReferenceId")]
    public string LoopReferenceId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the zero-based iteration index of the innermost active loop when this node
    /// executed. -1 indicates the node did not run inside a loop.
    /// </summary>
    [JsonPropertyName("loopIterationIndex")]
    public int LoopIterationIndex { get; set; } = -1;
    [JsonPropertyName("inputs")]
    public Dictionary<string, string> Inputs { get; set; } = new();

    [JsonPropertyName("outputs")]
    public Dictionary<string, string> Outputs { get; set; } = new();
}
