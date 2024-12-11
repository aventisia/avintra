namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an entity that stores flow data.
/// </summary>
public class Flow : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow. Max-20 characters.
    /// </summary>
    [MaxLength(20)]
    public FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the thumbnail of the flow. Max-255 characters.
    /// A snapshot of the flow which will be taken by the studio at the time of saving.
    /// </summary>
    [MaxLength(255)]
    public string? Thumbnail { get; set; }

    /// <summary>
    /// Gets or sets the description of the flow. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the flow's nodes, edges, and viewport JSON data in string format. The default value will be an empty object.
    /// </summary>
    public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    /// <summary>
    /// Gets or sets the ID of the project to which the flow record belongs.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Gets or sets the project this flow is associated with.
    /// </summary>
    [ForeignKey("ProjectId")]
    public virtual Project? Project { get; set; }

    /// <summary>
    /// Gets or sets the list of FlowComments to manage the one-to-many relation.
    /// </summary>
    
    public virtual ICollection<FlowComment>? FlowComments { get; set; }

    /// <summary>
    /// Gets or sets the list of FlowTemplate to manage the one-to-many relation.
    /// </summary>
    public virtual ICollection<FlowTemplate>? FlowTemplate { get; set; }

}
