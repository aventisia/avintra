namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the details of an inferencing model used in machine learning tasks.
/// </summary>
public class InferencingModelTemplateDto
{
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
}
