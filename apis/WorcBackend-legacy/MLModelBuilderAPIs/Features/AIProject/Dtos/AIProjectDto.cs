namespace MLModelBuilderAPIs.DTOs;

public class AIProjectDto
{
    /// <summary>
    /// Gets or sets the primary key for the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the latest version ID of the ai project
    /// </summary>
    public Guid LatestVersionId { get; set; }

    /// <summary>
    /// Gets or sets the name of ML model. Max character is 50.
    /// </summary>
    [StringLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of ML model.
    /// </summary>
    public AIProjectTypeEnum? Type { get; set; }

    /// <summary>
    /// Gets or sets the documents processed for this record
    /// </summary>
    public int? DocsProcessed { get; set; }

    /// <summary>
    /// Gets or sets the accuracy for the record
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the type of LLM.
    /// </summary>/
    public List<string>? LLMs { get; set; }

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
    /// Gets or sets a value indicating whether the model has been published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the model was published.
    /// </summary>
    public DateTimeOffset? PublishedOn { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the date of creation of ML model.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who modified the record last.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}