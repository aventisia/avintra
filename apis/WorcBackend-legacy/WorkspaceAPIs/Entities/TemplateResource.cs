namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a file resource linked to a project template, such as configuration or setup files.
/// </summary>
[Table("agent_FlowTemplateResources")]
public class TemplateResource : BaseEntity
{
    /// <summary>
    /// Gets or sets the unique identifier of the tenant (used for multi-tenant filtering).
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the uploaded file. Maximum length is 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the file extension of the uploaded resource (e.g., "txt", "json").
    /// </summary>
    public required string Extension { get; set; }

    /// <summary>
    /// Gets or sets the file size in bytes.
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Gets or sets the URL or local path pointing to the uploaded or external resource.
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the file is stored locally.
    /// </summary>
    public bool IsLocal { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the associated project template.
    /// </summary>
    public Guid ProjectTemplateId { get; set; }

    /// <summary>
    /// Gets or sets the related project template entity.
    /// </summary>
    [ForeignKey("ProjectTemplateId")]
    public virtual ProjectTemplate? ProjectTemplate { get; set; }
}
