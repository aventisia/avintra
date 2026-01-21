namespace MLModelBuilderAPIs.Entities;

[Table("as_VersionResources")]
public class VersionResource : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant Id for multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of resource. Max 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the extension type of resource. 
    /// </summary>
    public required string Extension { get; set; }

    /// <summary>
    /// Gets or sets the size of resource (if it's a file). 
    /// </summary>
    public long? Size { get; set; }

    /// <summary>
    /// Gets or sets the relative (in case of local files/links) or absolute path (in case of remote files/links) of resource. 
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// Gets or sets the flag indicating whether resource is uploaded/ local file.
    /// </summary>
    public bool IsLocal { get; set; }

    /// <summary>
    /// Gets or sets the flag indicating whether resource is added during the setup testing.
    /// </summary>
    public bool IsSetupTest { get; set; }

    /// <summary>
    /// Gets or sets the AI project version record's primary key to which this record is associated.
    /// </summary>
    public Guid AIProjectVersionId { get; set; }

    /// <summary>
    /// Gets or sets the text content of the resource (if applicable).
    /// </summary>
    /// <remarks>
    /// When <see cref="IsLocal"/> is true, this property can store the text content of the local file.
    /// This allows reuse of the extracted text for AI tasks without reprocessing the file each time.
    /// </remarks>
    public string? ResourceText { get; set; }

    /// <summary>
    /// Gets or sets the AI project version to which this resource is associated.
    /// </summary>
    [ForeignKey("AIProjectVersionId")]
    public virtual AIProjectVersion? AIProjectVersion { get; set; }

    /// <summary>
    /// Gets or sets the extracted datas associated with this version resource.
    /// </summary>
    public virtual ICollection<ExtractedData>? ExtractedDatas { get; set; }
}