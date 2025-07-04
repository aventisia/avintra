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
    /// Gets or sets the description of the flow block.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the access level for the flow block. Possible values include: Agent Level, Tenant Level, and Public.
    /// </summary>
    public AccessTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the JSON string representing the flow version's nodes, edges, and viewport. The default value is an empty object.
    /// </summary>
    public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    /// <summary>
    /// Gets or sets the JSON string containing the flow version's variables, including the name, value, and data type for each variable.
    /// </summary>
    public string? FlowVariablesObject { get; set; }

    /// <summary>
    /// Gets or sets the JSON string that defines the input and output data structure for the flow version.
    /// </summary>
    public string? InputOutputObject { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow version to which this flow block belongs.
    /// </summary>
    public required Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the associated flow version entity corresponding to the specified FlowVersionId.
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }
}
