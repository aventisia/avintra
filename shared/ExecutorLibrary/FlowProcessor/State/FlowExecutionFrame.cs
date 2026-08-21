namespace ExecutorLibrary.FlowProcessor.State;

public class FlowExecutionFrame
{
    public ReactFlowDataModel Flow { get; set; } = new();

    public string ReturnNodeId { get; set; } = string.Empty;

    /// <summary>
    /// The id of the visible edge in the parent flow that connects the sub-flow node to
    /// <see cref="ReturnNodeId"/>. Reported to consumers (e.g. the Studio canvas) so the
    /// edge leaving a block/callAgent turns green once execution actually follows it.
    /// </summary>
    public string? ReturnEdgeId { get; set; }
    /// <summary>
    /// The id of the parent-flow node (block/callAgent) that invoked this sub-flow. Used to
    /// report node completion once the sub-flow returns, so live execution UI can switch
    /// from the running spinner to the success/failed indicator.
    /// </summary>
    public string CallerNodeId { get; set; } = string.Empty;
    public Dictionary<string, ConditionalBranchState> ConditionalStates { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    public Dictionary<string, LoopState> LoopStates { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
