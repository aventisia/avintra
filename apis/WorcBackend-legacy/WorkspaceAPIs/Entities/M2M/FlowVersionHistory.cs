namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a historical snapshot of a flow version, including its structure, variables,
/// and input/output configuration, with support for multi-tenancy.
/// </summary>
[Table("agent_FlowVersionHistory")]
public class FlowVersionHistory : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant identifier used to isolate data in multi-tenant environments.
    /// </summary>
    public Guid TenantId { get; set; }

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
    /// Gets or sets the identifier of the flow version associated with this version history record.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Navigation property referencing the related flow version.
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Navigation property for jobs executed using this flow version history snapshot.
    /// </summary>
    public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();
}