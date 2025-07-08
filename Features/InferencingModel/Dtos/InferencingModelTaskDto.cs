namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents a DTO for an inferencing model task.
/// </summary>
public class InferencingModelTaskDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the task.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the task.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the configuration type of the task.
    /// </summary>
    public required LLMConfigurationTypesEnum ConfigurationType { get; set; }

    /// <summary>
    /// Gets or sets the LLM (Large Language Model) used.
    /// </summary>
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets the secret key string.
    /// </summary>
    public string? SecretKey { get; set; }

    /// <summary>
    /// Gets or sets the node prompt to guide the model's behavior.
    /// </summary>
    public required string NodePrompt { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for the model's randomness.
    /// </summary>
    public required double Temperature { get; set; }

    /// <summary>
    /// Gets or sets the extraction task details.
    /// </summary>
    public ExtractionTaskDto? Extraction { get; set; }

    /// <summary>
    /// Gets or sets the classification task details.
    /// </summary>
    public ClassificationTaskDto? Classification { get; set; }

    /// <summary>
    /// Gets or sets the summarization task details.
    /// </summary>
    public SummarizationTaskDto? Summarization { get; set; }

    /// <summary>
    /// Gets or sets the sentiment analytics task details.
    /// </summary>
    public SentimentAnalyticTaskDto? SentimentAnalytics{ get; set; }

    /// <summary>
    /// Gets or sets the question-answering task details.
    /// </summary>
    public QuestionAnswerTaskDto? QuestionAnswer { get; set; }
}
