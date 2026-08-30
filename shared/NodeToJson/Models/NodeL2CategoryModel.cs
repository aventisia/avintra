namespace NodeToJson.Models;

internal class NodeL2CategoryModel
{
    public required string Label { get; set; }
    public required string Description { get; set; }
    // TODO: Keep only Icon instead of Icon and Img once migration from NodeExecutor to RunnerApp is complete
    public string? Img { get; set; }
    public string? Icon { get; set; }
    public List<string>? DoNotRenderIf { get; set; }
    // TODO: Rename to Nodes once migration from NodeExecutor to RunnerApp is complete
    public List<NodeMetadataModel> Actions { get; set; } = [];
}
