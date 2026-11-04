namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Request body to enable or disable a library tool for the current tenant.
/// </summary>
public class SetToolEnabledStateRequest
{
    /// <summary>
    /// Gets or sets a value indicating whether the library tool should be enabled; required.
    /// </summary>
    public bool? IsEnabled { get; set; }
}
