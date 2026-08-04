namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Request body to activate or deactivate a tool.
/// </summary>
public class SetToolActiveStateRequest
{
    /// <summary>
    /// Gets or sets a value indicating whether the tool should be active.
    /// </summary>
    public bool IsActive { get; set; }
}
