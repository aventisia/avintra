namespace NodeToJson.Models;

internal class NodeL1CategoryModel
{
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    // TODO: Rename to NodeL2Categories once migration from NodeExecutor to RunnerApp is complete
    public List<NodeL2CategoryModel> ActionCategories { get; set; } = []; 
}
