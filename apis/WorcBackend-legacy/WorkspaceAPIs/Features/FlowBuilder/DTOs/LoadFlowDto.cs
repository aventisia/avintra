namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for loading flow properties when a user opens a flow in the studio.
/// </summary>
public class LoadFlowDto
{
    /// <summary>
    /// Gets or sets the primary key of the flow record.
    /// </summary>
    public Guid Id { get; set; }

    // <summary>
    /// Gets or sets the version ID of the flow.
    /// </summary>
    public Guid VersionId { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the flow's nodes, edges, and viewport JSON data in string format
    /// </summary>
    public string? ReactFlowObject { get; set; }

    /// <summary>
    /// Gets or sets the FlowVariablesObject.
    /// This property contains a JSON string that includes the name, value, and datatype of each variable.
    /// </summary>
    public string? FlowVariablesObject { get; set; }

    /// <summary>
    /// Gets or sets the InputOutputObject, which is a JSON string that defines the input and output data for the flow.
    /// </summary>
    public string? InputOutputObject { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version is in locked state.
    /// </summary>
    public bool IsLocked { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version is in draft state.
    /// </summary>
    public bool IsDraft { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version has been published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version has been archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow.
    /// </summary>
    public FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the description of the flow
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum? AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets the supported platforms for the flow version as a comma-separated string.
    /// </summary>
    public string? SupportedPlatform { get; set; }

    /// <summary>
    /// Gets or sets the execution configuration for the flow version as a JSON string.
    /// </summary>
    public ExecutionSettings? Settings { get; set; }
}
