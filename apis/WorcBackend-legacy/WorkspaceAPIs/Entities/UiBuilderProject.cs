namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a custom UI builder project.
/// </summary>
[Table("uibuilder_Projects")]
public class UiBuilderProject : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this project belongs to.
    /// Null indicates the project is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the name of the project. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the project. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project has been published.
    /// Publishing pins a version and is repeatable via re-publish; Disable hides instead of un-publishing.
    /// </summary>
    public bool IsPublished { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether the published project is visible to all users within the tenant.
    /// </summary>
    public bool IsPublishedTenantWide { get; set; } = false;

    /// <summary>
    /// Gets or sets the pinned published version number, or null when never published.
    /// </summary>
    public int? PublishedVersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the data sources bound to the project. Stored as a JSON column.
    /// </summary>
    public List<UiBuilderDataConnection> DataConnections { get; set; } = new();

    /// <summary>
    /// Gets or sets standing instructions sent with every generation for the project. Max-4000 characters.
    /// </summary>
    [MaxLength(4000)]
    public string? Instructions { get; set; }

    /// <summary>
    /// Gets or sets the visual theme applied to generated interfaces, or null for the platform default. Stored as a JSON column.
    /// </summary>
    public UiBuilderTheme? Theme { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project is offered to the tenant as a template.
    /// </summary>
    public bool IsTemplate { get; set; } = false;

    /// <summary>
    /// Gets or sets the list of generated versions to manage the one-to-many relation.
    /// </summary>
    public virtual ICollection<UiBuilderVersion>? UiBuilderVersions { get; set; }

    /// <summary>
    /// Gets or sets the list of uploaded assets to manage the one-to-many relation.
    /// </summary>
    public virtual ICollection<UiBuilderAsset>? UiBuilderAssets { get; set; }
}
