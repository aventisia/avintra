namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a request to update a work item of a queue bound to a custom UI builder project.
/// </summary>
public class UiBuilderDataItemUpdateDto
{
    /// <summary>
    /// Gets or sets the ID of the work item to update.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the new status, or null to keep the current status.
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Gets or sets the full replacement payload as a JSON object, or null to keep the current payload.
    /// </summary>
    public JsonElement? WorkItemData { get; set; }
}
