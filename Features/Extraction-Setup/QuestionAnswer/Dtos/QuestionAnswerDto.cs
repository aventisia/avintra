namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Data transfer object representing a QuestionAnswer model configuration, 
/// including setup parameters and user audit metadata.
/// </summary>
public class QuestionAnswerDto
{
    /// <summary>
    /// Unique identifier for the model configuration.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Configuration details for the QuestionAnswer model.
    /// Defaults to an empty setup if not provided.
    /// </summary>
    public QuestionAnswerSetupDto? SetupObject { get; set; }

    /// <summary>
    /// Timestamp indicating when the configuration was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// ID of the user who created the configuration.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// ID of the user who last modified the configuration.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Full name of the configuration creator.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Username of the configuration creator.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}

/// <summary>
/// Encapsulates the setup information for a QuestionAnswer task,
/// including context input, prompt, and optional labeled answers.
/// </summary>
public class QuestionAnswerSetupDto
{
    /// <summary>
    /// Text context used as input for the question-answering model.
    /// </summary>
    [Required]
    public required string Context { get; set; }

    /// <summary>
    /// Prompt provided to guide the model in generating answers.
    /// </summary>
    [Required]
    public required string Prompt { get; set; }

    /// <summary>
    /// Optional list of predefined question-answer labels for extended guidance or evaluation.
    /// </summary>
    public List<QuestionAnswerLabelDto>? QuestionAnswers { get; set; }

    /// <summary>
    /// Specifies the type or identifier of the large language model (LLM) being used.
    /// </summary>
    public string? LLM { get; set; }
}

/// <summary>
/// Represents a classification label in a QuestionAnswer context,
/// optionally accompanied by usage guidance or instructions.
/// </summary>
public class QuestionAnswerLabelDto
{
    /// <summary>
    /// Gets or sets unique identifier for the sentiment category.
    /// </summary>
    public string Id { get; set; } = $"{Guid.NewGuid()}";

    /// <summary>
    /// Descriptive name of the label (e.g., "Relevant", "Not Relevant").
    /// </summary>
    [Required, StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Additional guidance or notes explaining how to apply the label.
    /// </summary>
    public string? Instructions { get; set; }
}