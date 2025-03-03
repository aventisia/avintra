namespace WorkspaceAPIs.Entities;

public class FlowVersion : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

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
    /// Gets or sets the flow's nodes, edges, and viewport JSON data in string format. The default value will be an empty object.
    /// </summary>
    public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    /// <summary>
    /// Gets or sets the ReactFlowVariables.
    /// This property contains a JSON string that includes the name, value, and datatype of each variable.
    /// </summary>
    public string? ReactFlowVariables { get; set; } = "{\"variables\":[]}";

    /// <summary>
    /// Gets or sets the ID of the flow to which the flow version belongs.
    /// </summary>
    public required Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the project this flow is associated with.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Configure Many-to-Many relationship between Machine and flow
    /// </summary>
    public virtual ICollection<MachineFlow>? MachineFlows { get; set; }
}