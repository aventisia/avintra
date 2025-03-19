namespace MLModelBuilderAPIs.Entities;

public class UploadedDoc : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of Uploaded file. Max character is 255.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the extension type of uploaded file. 
    /// </summary>
    public required string Extension { get; set; }

    /// <summary>
    /// Gets or sets the size of uploaded file. 
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Gets or sets the path of uploaded file. 
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// Gets or sets the type of data which will be extracted from uploaded file. 
    /// </summary>
    public ExtractedDataType Type { get; set; }

    /// <summary>
    /// Gets or sets the ML model record's primary key to which this record is associated.
    /// </summary>/
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the model library to which this data model is associated with.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }

    /// <summary>
    /// Gets or sets the extracted data to which this data model is associated with.
    /// </summary>
    public virtual ExtractedData? ExtractedData { get; set; }

}