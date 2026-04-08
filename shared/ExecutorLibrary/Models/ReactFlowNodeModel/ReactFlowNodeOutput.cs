namespace ExecutorLibrary.Models;

public class ReactFlowNodeOutput
{
    public string Key { get; set; } = string.Empty;
    public ReactFlowNodeOutputValue Value { get; set; } = new();
}
