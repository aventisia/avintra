namespace WorkspaceAPIs.DTOs;

public class FlowVersionSearchResultDto
{
    /// <summary>
    /// Gets or sets the ID of the flow version.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow this version is associated with.
    /// </summary>
    [RequiredGuid]
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    public required string FlowName { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version has been published.
    /// </summary>
    public bool IsPublished { get; set; }
}