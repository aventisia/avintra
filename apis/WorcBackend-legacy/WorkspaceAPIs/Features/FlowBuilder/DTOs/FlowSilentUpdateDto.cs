namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for updating a flow silently in the background whenever 
/// a user makes any changes, with a delay of 5 seconds since the last change made.
/// </summary>
public class FlowSilentUpdateDto
{
    /// <summary>
    /// Gets or sets the primary key of the flow record.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    // <summary>
    /// Gets or sets the version ID of the flow.
    /// </summary>
    [RequiredGuid]
    public Guid VersionId { get; set; }

    /// <summary>
    /// Gets or sets the thumbnail of the flow.
    /// </summary>
    [StringLength(255)]
    public string? Thumbnail { get; set; }

    /// <summary>
    /// Gets or sets the flow's nodes, edges, and viewport JSON data in string format
    /// </summary>
    public required string ReactFlowObject { get; set; }

    /// <summary>
    /// Gets or sets the FlowVariablesObject.
    /// This property contains a JSON string that includes the name, value, and datatype of each variable.
    /// </summary>
    public string? FlowVariablesObject { get; set; }

    /// <summary>
    /// Gets or sets the InputOutputObject, which is a JSON string that defines the input and output data for the flow.
    public string? InputOutputObject { get; set; }

    /// <summary>
    /// Gets or sets the supported platforms for the flow version as a comma-separated string.
    /// </summary>
    public string? SupportedPlatform { get; set; }
}
