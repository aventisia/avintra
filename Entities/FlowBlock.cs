namespace WorkspaceAPIs.Entities;

public class FlowBlock : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, enabling multi-tenant filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow block.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description for the flow block.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the sharing level for the flow block. Possible values include: Agent Level, Tenant Level, and Public.
    /// </summary>
    public BlockSharingTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the JSON string representing the flow’s nodes, edges, and viewport. The default value is an empty object.
    /// </summary>
    public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    /// <summary>
    /// Gets or sets the JSON string containing the flow variables, including the name, value, and data type for each variable.
    /// </summary>
    public string? FlowVariablesObject { get; set; }

    /// <summary>
    /// Gets or sets the JSON string that defines the flow's input and output data, referred to as the InputOutputObject.
    /// </summary>
    public string? InputOutputObject { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow that this flow block belongs to.
    /// </summary>
    public required Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the associated flow record corresponding to the given FlowId.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }
}
