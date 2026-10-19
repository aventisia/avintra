namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a request to add a work item to a queue bound to a custom UI builder project.
/// </summary>
public class UiBuilderDataItemInsertDto
{
    /// <summary>
    /// Gets or sets the work item payload as a JSON object.
    /// </summary>
    public JsonElement WorkItemData { get; set; }

    /// <summary>
    /// Gets or sets the description of the work item.
    /// </summary>
    public string? Description { get; set; }
}
