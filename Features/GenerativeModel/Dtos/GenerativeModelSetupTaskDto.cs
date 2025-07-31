namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the configuration settings for a specific AI task,
/// including the setup for defining the generative model's identity, behavior, domain, and capabilities.
/// </summary>
public class GenerativeModelSetupTaskDto : GenerativeModelDefaultSetupDto
{
    /// <summary>
    /// Gets or sets the configuration setup for the generative model's task,
    /// detailing how the model should handle generation tasks (e.g., text generation, image generation).
    /// </summary>
    public GenerativeModelSetupDto? SetupObject { get; set; }
}

/// <summary>
/// Defines the setup configuration for a generative model,
/// including its identity, behavioral traits, knowledge base, and capabilities for generation tasks.
/// </summary>
public class GenerativeModelSetupDto
{
    /// <summary>
    /// Gets or sets the display name of the generative model.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the primary role or function of the generative model (e.g., text generation, image generation).
    /// </summary>
    public required string RoleOrObjective { get; set; }

    /// <summary>
    /// Gets or sets the category or domain in which the generative model operates (e.g., text, images, music).
    /// </summary>
    public required string CategoryOrDomain { get; set; }

    // Behavioral Settings

    /// <summary>
    /// Gets or sets the style or creativity of the output the generative model should produce (e.g., highly creative, precise).
    /// </summary>
    public required string OutputStyle { get; set; }

    /// <summary>
    /// Gets or sets the guidelines or instructions that define how the generative model should generate content.
    /// </summary>
    public required string GenerationInstructions { get; set; }

    /// <summary>
    /// Gets or sets the restrictions or boundaries, outlining what content the model should avoid generating.
    /// </summary>
    public required string ExclusionsOrBoundaries { get; set; }

    // Knowledge Base & Context

    /// <summary>
    /// Gets or sets a list of document-specific instructions that shape the generative model's output behavior.
    /// </summary>
    public List<GenerativeModelDocumentInstruction>? Documents { get; set; }

    /// <summary>
    /// Gets or sets the time frame during which past instructions or context remain relevant for generating outputs.
    /// </summary>
    public required string ContextMemoryTimeframe { get; set; }

    // Output Capabilities

    /// <summary>
    /// Gets or sets the specific configuration for how the model should generate content (e.g., style, length, temperature).
    /// </summary>
    public required GenerationConfigurationDto GenerationConfiguration { get; set; }
}

/// <summary>
/// Provides instructions for handling documents associated with the generative model,
/// including how they should influence its behavior or output.
/// </summary>
public class GenerativeModelDocumentInstruction
{
    /// <summary>
    /// Gets or sets the unique identifier for the uploaded document.
    /// </summary>
    public required Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the file path of the uploaded document.
    /// </summary>
    public required string FilePath { get; set; }

    /// <summary>
    /// Gets or sets the name of the document associated with the generative model.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets any specific instructions for how the document should influence the generative model's output.
    /// </summary>
    public string? Instructions { get; set; }
}

/// <summary>
/// Configuration settings related to the generative model’s output generation parameters.
/// </summary>
public class GenerationConfigurationDto
{
    /// <summary>
    /// Gets or sets the desired randomness or creativity level for the generated output.
    /// </summary>
    public required double Temperature { get; set; }

    /// <summary>
    /// Gets or sets the desired length or size of the generated output.
    /// </summary>
    public required int OutputLength { get; set; }

    /// <summary>
    /// Gets or sets whether to include additional context or randomness in the output.
    /// </summary>
    public required bool IncludeContextualReferences { get; set; }
}
