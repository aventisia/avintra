namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an image uploaded to a custom UI builder project, such as a logo, that generated interfaces can show.
/// </summary>
public class UiBuilderAsset : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this asset belongs to.
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the owning project.
    /// </summary>
    public required Guid UiBuilderProjectId { get; set; }

    /// <summary>
    /// Gets or sets the owning project.
    /// </summary>
    [ForeignKey("UiBuilderProjectId")]
    public virtual UiBuilderProject? UiBuilderProject { get; set; }

    /// <summary>
    /// Gets or sets the name generated code uses to reach the asset, unique per project. Max-64 characters.
    /// </summary>
    [MaxLength(64)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the image media type. Max-100 characters.
    /// </summary>
    [MaxLength(100)]
    public required string ContentType { get; set; }

    /// <summary>
    /// Gets or sets the image bytes.
    /// </summary>
    public required byte[] Data { get; set; }

    /// <summary>
    /// Gets or sets the image size in bytes.
    /// </summary>
    public int SizeBytes { get; set; }
}
