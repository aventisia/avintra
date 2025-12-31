namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a data model entity 
/// </summary>
public class ExtractedData : BaseEntity, IMustHaveTenant
{

    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the data model's fields JSON data in string format. The default value will be an empty object.
    /// </summary>
    public string? DataObject { get; set; }

    /// <summary>
    /// Gets or sets the accuracy for the record
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the token count related to this data record.
    /// </summary>
    public int TokenCount { get; set; }

    /// <summary>
    /// Gets or sets the number of times this data record has been executed.
    /// </summary>
    public int ExecutionCount { get; set; }

    /// <summary>
    /// Gets or sets the number of failed executions for this data record.
    /// </summary>
    public int FailedCount { get; set; }

    /// <summary>
    /// Gets or sets the execution time in seconds.
    /// </summary>
    public int ExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the model or data has been submitted for fine-tuning.
    /// </summary>
    public bool SubmitForFineTuning { get; set; }

    /// <summary>
    /// Gets or sets the uploaded version resource record's primary key to which this record is associated.
    /// </summary>/
    public Guid VersionResourceId { get; set; }

    /// <summary>
    /// Gets or sets the primary key of the version task associated with this record.
    /// </summary>/
    public Guid VersionTaskId { get; set; }

    /// <summary>
    /// Gets or sets the AI project version record's primary key to which this record is associated.
    /// </summary>
    public Guid AIProjectVersionId { get; set; }

    /// <summary>
    /// Gets or sets the AI project version to which this resource is associated.
    /// </summary>
    [ForeignKey("AIProjectVersionId")]
    public virtual AIProjectVersion? AIProjectVersion { get; set; }

    /// <summary>
    /// Gets or sets the AI version task that this extracted data is associated with.
    /// </summary>
    [ForeignKey("VersionTaskId")]
    public virtual VersionTask? VersionTask { get; set; }

    /// <summary>
    /// Gets or sets the uploaded version resource to which this extracted data is associated with.
    /// </summary>
    [ForeignKey("VersionResourceId")]
    public virtual VersionResource? VersionResource { get; set; }

    /// <summary>
    /// Gets or sets the collection of scheduled models related to this schedule model.
    /// </summary>
    public virtual ICollection<ScheduledModel>? ScheduledModels { get; set; }
}