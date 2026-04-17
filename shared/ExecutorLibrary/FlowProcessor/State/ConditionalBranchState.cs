namespace ExecutorLibrary.FlowProcessor.State;

public class ConditionalBranchState
{
    public string Id { get; set; } = string.Empty;

    public string ConditionalMode { get; set; } = string.Empty;

    public Queue<string> RemainingBranches { get; set; } = new();

    public int ExecutedBranchesCount { get; set; }

    public string MergeBranchesNodeId { get; set; } = string.Empty;
}
