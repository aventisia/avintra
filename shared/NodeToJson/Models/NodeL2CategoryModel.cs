namespace NodeToJson.Models;

internal class NodeL2CategoryModel
{
    public required string Label { get; set; }
    public required string Description { get; set; }
    public required string Icon { get; set; }
    public List<string>? DoNotRenderIf { get; set; }
    public List<NodeMetadataModel> Nodes { get; set; } = [];
}
