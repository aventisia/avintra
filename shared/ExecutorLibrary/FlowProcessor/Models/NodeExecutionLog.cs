namespace ExecutorLibrary.FlowProcessor.Models;

public class NodeExecutionLog
{
    public string NodeId { get; set; } = string.Empty;

    public string NodeName { get; set; } = string.Empty;

    public string NodeUniqueName { get; set; } = string.Empty;

    public bool IsSuccess { get; set; }

    public double Duration { get; set; }

    public List<NodeLogKeyValue> Inputs { get; set; } = new();

    public List<NodeLogKeyValue> Outputs { get; set; } = new();
}
