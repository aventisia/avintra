namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an entity that stores project data.
/// </summary>
[Table("Projects")]
public class Project : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi-tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type of the project.
    /// </summary>
    [MaxLength(20)]
    public ProjectTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the name of the project.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the project.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the list of Flows to manage the one-to-many relation.
    /// </summary>
    public virtual ICollection<Flow>? Flows { get; set; }
}