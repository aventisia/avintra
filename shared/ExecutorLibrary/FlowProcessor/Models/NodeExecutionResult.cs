namespace ExecutorLibrary.FlowProcessor.Models;

public class NodeExecutionResult
{
    public bool IsSuccess { get; set; }

    public bool? ConditionResult { get; set; }

    public NodeExecutionLog NodeLog { get; set; } = new();

    public Dictionary<string, object?> OutputValues { get; set; } = new();
}
