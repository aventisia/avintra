namespace ExecutorLibrary.FlowProcessor.State;

public class LoopState
{
    public string Id { get; set; } = string.Empty;

    public string LoopType { get; set; } = string.Empty;

    public string MergeBranchesNodeId { get; set; } = string.Empty;

    public string LoopBodyStartNodeId { get; set; } = string.Empty;

    public int CurrentIteration { get; set; }

    public int MaxIterations { get; set; }

    public string ListVariableName { get; set; } = string.Empty;

    public string ItemVariableName { get; set; } = string.Empty;

    public string ItemIndexVariableName { get; set; } = string.Empty;

    public int CurrentIndex { get; set; }

    public int TotalCount { get; set; }
}
