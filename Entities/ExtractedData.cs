namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a data model entity 
/// </summary>
public class ExtractedData : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the ML model record's primary key to which this record is associated.
    /// </summary>/
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the data model's fields JSON data in string format. The default value will be an empty object.
    /// </summary>
    public string? DataObject { get; set; }

    /// <summary>
    /// Gets or sets the uploaded doc record's primary key to which this record is associated.
    /// </summary>/
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the accuracy for the record
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the type of extra
    /// </summary>
    public ExtractedDataType? Type { get; set; }

    /// <summary>
    /// Gets or sets the model library to which this data model is associated with.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }

    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the uploaded doc to which this data model is associated with.
    /// </summary>
    [ForeignKey("DocId")]
    public virtual UploadedDoc? UploadedDoc { get; set; }
}