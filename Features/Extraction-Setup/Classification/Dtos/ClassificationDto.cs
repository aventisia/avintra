namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the metadata and setup information for a classification model, including creation details and configuration.
/// </summary>
public class ClassificationDto
{
    /// <summary>
    /// Unique identifier for the the name of model library.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Configuration settings for the classification process.
    /// Defaults to an empty object if unspecified.
    /// </summary>
    public ClassificationSetupDto? SetupObject { get; set; }

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
    /// Full name of the user who created the configuration.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Username of the user who created the configuration.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}

/// <summary>
/// Defines the setup details for a classification model, including context, prompt, and categories.
/// </summary>
public class ClassificationSetupDto
{
    /// <summary>
    /// Contextual description to guide the classification process.
    /// </summary>
    [Required]
    public required string Context { get; set; }

    /// <summary>
    /// Instructional prompt used to drive model behavior during classification.
    /// </summary>
    [Required]
    public required string Prompt { get; set; }

    /// <summary>
    /// Enum to define behavior when no clear match is found during classification.
    /// </summary>
    // [Required]
    // public required ClassificationUncertaintyAction UncertaintyAction { get; set; }

    /// <summary>
    /// Enum to control the multiple class scenario when no single match is found.
    /// </summary>
    public bool AllowMultipleClasses { get; set; }

    /// <summary>
    /// A list of classification categories with optional instructions.
    /// </summary>
    public List<ClassificationCategoryDto>? Categories { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for creativity and randomness in the persona’s responses.
    /// </summary>
    public required double Temperature { get; set; } = 0.2;

    /// <summary>
    /// Specifies the type or identifier of the large language model (LLM) being used.
    /// </summary>
    public string? LLM { get; set; }
}

/// <summary>
/// Represents a classification category, with an optional explanation to assist with classification logic.
/// </summary>
public class ClassificationCategoryDto
{
    /// <summary>
    /// Gets or sets the unique key associated with the sentiment category.
    /// </summary>
    public string Index { get; set; } = string.Empty;

    /// <summary>
    /// The name of the classification category (e.g., "Spam", "Not Spam").
    /// </summary>
    [Required, StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Optional instructions to clarify the criteria for this category.
    /// </summary>
    public string? Instructions { get; set; }
}
