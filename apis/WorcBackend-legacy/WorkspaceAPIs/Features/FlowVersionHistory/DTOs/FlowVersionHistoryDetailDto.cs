namespace WorkspaceAPIs.DTOs;

public class FlowVersionHistoryDetailDto
{
    /// <summary>
    /// Gets or sets the unique identifier of this flow version history entry.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the related flow version.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the version number of the flow.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the serialized JSON representation of the flow structure,including nodes, edges, and viewport configuration.
    /// </summary>
    public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    /// <summary>
    /// Gets or sets the serialized JSON object containing flow variables, including each variable's name, value, and data type.
    /// </summary>
    public string? FlowVariablesObject { get; set; }

    /// <summary>
    /// Gets or sets the serialized JSON definition of the flow's input and output configuration.
    /// </summary>
    public string? InputOutputObject { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the parent flow.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the name of the parent flow.
    /// </summary>
    public string? FlowName { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created this history entry.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this history entry.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this history entry was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the initials of the user who created this history entry.
    /// </summary>
    public string? CreatedByUserInitials { get; set; }
}