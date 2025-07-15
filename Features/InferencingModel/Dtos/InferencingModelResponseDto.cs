namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the details of an inferencing model used in machine learning tasks.
/// </summary>
public class InferencingModelResponseDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the model used in the extraction process.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each processed file.
    /// </summary>
    public required List<InferencingModelTaskResponseDto> ExtractedData { get; set; }
}

/// <summary>
/// Represents the response data for a single inferencing model task.
/// </summary>
public class InferencingModelTaskResponseDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the task.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the file from which data was extracted.
    /// </summary>
    public Guid FileId { get; set; }

    /// <summary>
    /// Gets or sets any remarks related to the extracted data (e.g., issues with extraction).
    /// </summary>
    public required string Remarks { get; set; }

    /// <summary>
    /// Gets or sets the token count for this data record.
    /// </summary>
    public int TokenCount { get; set; }

    /// <summary>
    /// Gets or sets the number of times this task has been executed.
    /// </summary>
    public int ExecutionCount { get; set; }

    /// <summary>
    /// Gets or sets the number of failed executions for this task.
    /// </summary>
    public int FailedCount { get; set; }

    /// <summary>
    /// Gets or sets the total execution time in seconds.
    /// </summary>
    public int ExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the extracted data for the extraction task.
    /// </summary>
    public ExtractionTaskExtractedDataDto? Extraction { get; set; }

    /// <summary>
    /// Gets or sets the extracted data for classification tasks.
    /// </summary>
    public List<ClassificationTaskExtractedDataDto>? Classification { get; set; }

    /// <summary>
    /// Gets or sets the extracted data for summarization tasks.
    /// </summary>
    public SummarizationTaskExtractedDataDto? Summarization { get; set; }

    /// <summary>
    /// Gets or sets the extracted data for sentiment analysis tasks.
    /// </summary>
    public List<SentimentAnalysisExtractedDataDto>? SentimentAnalytics { get; set; }

    /// <summary>
    /// Gets or sets the extracted data for question-answer tasks.
    /// </summary>
    public List<QuestionAnswerTaskExtractedDataDto>? QuestionAnswer { get; set; }
}