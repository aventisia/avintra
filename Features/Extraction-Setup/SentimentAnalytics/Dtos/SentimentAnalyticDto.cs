namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Contains metadata and configuration details for a sentiment analysis model.
/// </summary>
public class SentimentAnalyticDto
{
    /// <summary>
    /// Unique identifier for the sentiment analysis configuration.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Configuration details for the sentiment analysis setup.
    /// Defaults to an empty object if not provided.
    /// </summary>
    public SentimentAnalyticSetupDto? SetupObject { get; set; }

    /// <summary>
    /// The date and time when the configuration was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Identifier of the user who created the configuration.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Identifier of the user who last modified the configuration.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Full name of the user who created the configuration.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Username of the user who created the configuration.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}

/// <summary>
/// Specifies how sentiment analysis should be performed, including
/// contextual information, analysis prompt, and optional sentiment categories.
/// </summary>
public class SentimentAnalyticSetupDto
{
    /// <summary>
    /// Contextual description of the content to be analyzed, 
    /// which helps improve the model’s sentiment predictions.
    /// </summary>
    [Required]
    public required string Context { get; set; }

    /// <summary>
    /// Instructional prompt guiding the sentiment analysis behavior.
    /// Limited to a maximum of 1000 characters.
    /// </summary>
    [Required]
    public required string Prompt { get; set; }

    /// <summary>
    /// Optional list of sentiment categories to classify, each with optional guidance.
    /// </summary>
    public List<SentimentAnalyticsSetupCategoryDto>? Categories { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for creativity and randomness in the persona’s responses.
    /// </summary>
    public double Temperature { get; set; }

    /// <summary>
    /// Specifies the type or identifier of the large language model (LLM) being used.
    /// </summary>
    public string? LLM { get; set; }
}

/// <summary>
/// Defines a single sentiment category used in analysis, with an optional
/// description of how it should be interpreted or applied.
/// </summary>
public class SentimentAnalyticsSetupCategoryDto
{
    /// <summary>
    /// Gets or sets the unique key associated with the sentiment category.
    /// </summary>
    public string Index { get; set; } = string.Empty;

    /// <summary>
    /// Name of the sentiment category (e.g., "Positive", "Negative", "Neutral").
    /// </summary>
    [Required, StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Optional description or guidance for how this category should be applied.
    /// </summary>
    public string? Instructions { get; set; }
}