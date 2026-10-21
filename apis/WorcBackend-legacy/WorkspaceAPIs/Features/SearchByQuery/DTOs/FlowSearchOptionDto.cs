namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a flow search result.
/// </summary>
public class FlowSearchOptionDto : SelectOption
{
    /// <summary>
    /// Gets or sets the type of the flow.
    /// </summary>
    public FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the number of non-archived versions of the flow.
    /// </summary>
    public int VersionCount { get; set; }

    /// <summary>
    /// Gets or sets the latest modification time across the flow and its versions.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
