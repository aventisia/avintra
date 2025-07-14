namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the details of an inferencing model used in machine learning tasks.
/// </summary>
public class InferencingModelDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the inferencing model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the inferencing model.
    /// </summary>
    [StringLength(255)]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the inferencing model. 
    /// </summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the business context that the inferencing model addresses.
    /// </summary>
    public required string BusinessContext { get; set; }

    /// <summary>
    /// Gets or sets the extraction task setup for the inferencing model.
    /// </summary>
    public ExtractionTaskDto? Extraction { get; set; }

    /// <summary>
    /// Gets or sets the classification task setup for the inferencing model.
    /// </summary>
    public ClassificationTaskDto? Classification { get; set; }

    /// <summary>
    /// Gets or sets the summarization task setup for the inferencing model.
    /// </summary>
    public SummarizationTaskDto? Summarization { get; set; }

    /// <summary>
    /// Gets or sets the sentiment analytics task setup for the inferencing model.
    /// </summary>
    public SentimentAnalyticsTaskSDto? SentimentAnalytics { get; set; }

    /// <summary>
    /// Gets or sets the question answering task setup for the inferencing model.
    /// </summary>
    public QuestionAnswerTaskDto? QuestionAnswer { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the inferencing model was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who created the inferencing model.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who last modified the inferencing model.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created the inferencing model.
    /// This field is optional.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the inferencing model.
    /// This field is optional.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}
