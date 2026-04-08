namespace ExecutorLibrary.Models;

public class ReactFlowEdgeModel
{
    public string Source { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
    public string? SourceHandle { get; set; }
    public string? TargetHandle { get; set; }
    public string? Type { get; set; }
}
