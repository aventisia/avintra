namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a flow-version (agent) selectable option enriched with the platforms the agent
/// supports, so callers can tell whether cloud execution is available.
/// </summary>
public class FlowVersionSelectOption : SelectOption
{
    /// <summary>
    /// Gets or sets the comma-separated platforms the agent supports (for example "cloud" or
    /// "windows").
    /// </summary>
    public string? SupportedPlatform { get; set; }
}
