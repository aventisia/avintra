namespace ExecutorLibrary.FlowProcessor.State;

public class FlowExecutionFrame
{
    public ReactFlowDataModel Flow { get; set; } = new();

    public string ReturnNodeId { get; set; } = string.Empty;

    public Dictionary<string, ConditionalBranchState> ConditionalStates { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    public Dictionary<string, LoopState> LoopStates { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
