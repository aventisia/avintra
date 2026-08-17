namespace ExecutorLibrary.Models;

public class ReactFlowDataModel
{
    public List<ReactFlowNodeModel> Nodes { get; set; } = [];

    public List<ReactFlowEdgeModel> Edges { get; set; } = [];

    /// <summary>
    /// Optional JSON array describing the flow version's declared inputs/outputs.
    /// Used by sub-flow invocation to apply trigger defaults and validate required inputs.
    /// </summary>
    public string? InputOutputObject { get; set; }
}
