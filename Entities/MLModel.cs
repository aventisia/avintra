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
    /// Gets or sets the current setup status of the ML model.
    /// </summary>/
    public SetupStatusTypesEnum SetupStatus { get; set; }

    /// <summary>
    /// Gets or sets the accuracy for the record
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the data model's fields JSON data in string format. The default value will be an empty object.
    /// </summary>
    public string? SetupObject { get; set; }

    /// <summary>
    /// Stores the dynamically generated prompt as a string, typically created at runtime for use in model interactions or processing.
    /// </summary>
    public string? GeneratedPrompt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the model has been published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the model was published.
    /// </summary>
    public DateTimeOffset? PublishedOn { get; set; }

    /// <summary>
    /// Gets or sets the ML model to which this extracted data model is associated with.
    /// </summary>
    public virtual ICollection<ExtractedData>? ExtractedData { get; set; }

    /// <summary>
    /// Gets or sets the ML model to which this uploaded docs are associated.
    /// </summary>
    public virtual ICollection<UploadedDoc>? UploadedDocs { get; set; }

    /// <summary>
    /// Gets or sets the ML model to which this schedule model are associated.
    /// </summary>
    public virtual ICollection<ScheduledModel>? ScheduledModels { get; set; }
}