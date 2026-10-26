namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a folder that groups agents within a space.
/// </summary>
[Table("agent_Folders")]
public class Folder : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this folder belongs to.
    /// Null indicates the folder is in the default "Central" space.
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the name of the folder. Max-50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the folder. Max-250 characters.
    /// </summary>
    [MaxLength(250)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the palette color key of the folder (e.g. "indigo"). Max-20 characters.
    /// Null lets the client derive a color from the folder ID.
    /// </summary>
    [MaxLength(20)]
    public string? Color { get; set; }
}
