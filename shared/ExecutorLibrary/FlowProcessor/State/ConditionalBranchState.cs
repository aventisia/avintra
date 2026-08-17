namespace ExecutorLibrary.FlowProcessor.State;

public class ConditionalBranchState
{
    public string Id { get; set; } = string.Empty;

    public string ConditionalMode { get; set; } = string.Empty;

    public Queue<string> RemainingBranches { get; set; } = new();

    public int ExecutedBranchesCount { get; set; }

    public string MergeBranchesNodeId { get; set; } = string.Empty;

    /// <summary>
    /// The branch start node id selected by the router for execution (first matching case
    /// branch, or the default branch if no case matched).
    /// </summary>
    public string? SelectedBranchId { get; set; }

    /// <summary>
    /// Per-branch condition evaluation results for the router log. Key is branch node id,
    /// value is "True", "False", or "default".
    /// </summary>
    public Dictionary<string, string> BranchEvaluations { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
