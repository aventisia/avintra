namespace NodeToJson.Models;

internal class NodeL1CategoryModel
{
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public List<NodeL2CategoryModel> NodeL2Categories { get; set; } = [];
}
