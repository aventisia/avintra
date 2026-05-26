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
    /// Gets or sets a value indicating whether the flow is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the list of FlowComments to manage the one-to-many relation.
    /// </summary>

    public virtual ICollection<FlowComment>? FlowComments { get; set; }

    /// <summary>
    /// Gets or sets the list of FlowLog to manage the one-to-many relation.
    /// </summary>

    public virtual ICollection<FlowLog>? FlowLog { get; set; }
    /// Gets or sets the list of FlowVersions to manage the one-to-many relation.
    /// </summary>
    public virtual ICollection<FlowVersion>? FlowVersions { get; set; }

    /// <summary>
    /// Gets or sets the list of FlowUsers to manage the many-to-many relation.
    /// </summary>
    public virtual ICollection<FlowUser>? FlowUsers { get; set; }
}
