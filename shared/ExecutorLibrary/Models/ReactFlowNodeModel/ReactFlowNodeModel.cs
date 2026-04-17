namespace ExecutorLibrary.Models;

public class ReactFlowNodeModel
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public ReactFlowNodeData Data { get; set; } = new();
}