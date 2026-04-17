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
