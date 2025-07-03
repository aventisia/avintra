namespace WorkspaceAPIs.Entities;

public class FlowBlock : BaseEntity
{
    /// <summary>
    /// Gets or sets the name of the flow block.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description for the flow block.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the access level for the flow block. Possible values include: Agent Level, Tenant Level, and Public.
    /// </summary>
    public AccessTypesEnum Type { get; set; }

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
    /// Gets or sets the reference identifier associated with this flow block.
    /// This can refer to a Flow ID, a Tenant, or be null.
    /// </summary>
    public Guid? RefId { get; set; }
}
