namespace ExecutorLibrary.Models;

public class ReactFlowDataModel
{
    public List<ReactFlowNodeModel> Nodes { get; set; } = [];

    public List<ReactFlowEdgeModel> Edges { get; set; } = [];
}
