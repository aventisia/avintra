namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a user associated with a flow.
/// </summary>
public class FlowBlockDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the FlowUser record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow block.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description for the flow block.
    /// </summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the access level for the flow block. Possible values include: Agent Level, Tenant Level, and Public.
    /// </summary>
    public required AccessTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the JSON string representing the flow’s nodes, edges, and viewport. The default value is an empty object.
    /// </summary>
    public string? ReactFlowObject { get; set; }

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


    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
