namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to move a flow into a folder or to the top level.
/// </summary>
public class UpdateFlowFolderDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the flow to move.
    /// </summary>
    [RequiredGuid]
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the target folder. Null moves the flow to the top level.
    /// </summary>
    public Guid? FolderId { get; set; }
}
