namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the metadata and setup information for a classification model, including creation details and configuration.
/// </summary>
public class SummarizationDto
{
    /// <summary>
    /// Unique identifier for the the name of model library.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Configuration settings for the summarization process.
    /// Defaults to an empty object if unspecified.
    /// </summary>
    public SummarizationSetupDto? SetupObject { get; set; }

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
/// Data Transfer Object for configuring summarization model parameters.
/// This setup allows for multiple summarization strategies including MapReduce, Refine, and Stuff.
/// </summary>
public class SummarizationSetupDto
{
    /// <summary>
    /// The main context or source text to be summarized.
    /// </summary>
    [Required]
    public required string Context { get; set; }

    /// <summary>
    /// Maximum number of characters in each chunk of text during preprocessing.
    /// </summary>
    public int CharactersPerChunk { get; set; } = 0;

    /// <summary>
    /// Number of characters overlapping between consecutive chunks.
    /// </summary>
    public int ChunkOverlap { get; set; } = 0;

    /// <summary>
    /// Minimum total word count expected in the summary output.
    /// </summary>
    public int TotalMinimumWords { get; set; }

    /// <summary>
    /// Maximum total word count allowed in the summary output.
    /// </summary>
    public int TotalMaximumWords { get; set; }

    /// <summary>
    /// Specifies which summarization strategy to use: MapReduce, Refine, or Stuff.
    /// </summary>
    public SummarizationMethodTypesEnum? SummarizationMethod { get; set; }

    // ========== MapReduce Method ==========
    /// <summary>
    /// Prompt used for summarizing individual chunks (Map step).
    /// </summary>
    public string? MapIndividualSummaryPrompt { get; set; }

    /// <summary>
    /// Prompt used to combine individual summaries into the final output (Reduce step).
    /// </summary>
    public string? MapFinalCombinePrompt { get; set; }

    // ========== Refine Method ==========
    /// <summary>
    /// Initial prompt used for the first summary in the Refine method.
    /// </summary>
    public string? RefineInitialPrompt { get; set; }

    /// <summary>
    /// Prompt used to iteratively refine the summary with each new chunk.
    /// </summary>
    public string? RefineSubsequentPrompt { get; set; }

    // ========== Stuff Method ==========
    /// <summary>
    /// Single prompt used when all content is "stuffed" into one input for summarization.
    /// </summary>
    public string? StuffPrompt { get; set; }
}

