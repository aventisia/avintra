namespace MLModelBuilderAPIs.Entities;

public class MLModel : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of model library. Max character is 50.
    /// </summary>
    [MaxLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of ML model.
    /// </summary>
    public ModelTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the description of ML model 
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the date of training of ML model.
    /// </summary>
    public DateTimeOffset TrainedOn { get; set; }

    /// <summary>
    /// Gets or sets the status of ML model.
    /// </summary>/
    public ModelStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the type of LLM.
    /// </summary>/
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets the accuracy for the record
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the ML model to which this extracted data model is associated with.
    /// </summary>
    public virtual ICollection<ExtractedData>? ExtractedData { get; set; }

    /// <summary>
    /// Gets or sets the ML model to which this data fields are associated.
    /// </summary>
    public virtual ICollection<DataField>? DataFields { get; set; }

    /// <summary>
    /// Gets or sets the ML model to which this uploaded docs are associated.
    /// </summary>
    public virtual ICollection<UploadedDoc>? UploadedDocs { get; set; }

}