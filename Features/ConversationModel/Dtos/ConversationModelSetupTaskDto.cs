namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the configuration settings for a specific AI task,
/// including the setup for defining the AI persona's identity, behavior, domain, and communication capabilities.
/// </summary>
public class ConversationModelSetupTaskDto : ConversationalModelSetupDto
{
    /// <summary>
    /// Gets or sets the configuration setup for the AI persona,
    /// detailing how tasks (like sentiment analysis) should be performed.
    /// </summary>
    public ConversationModelSetupDto? SetupObject { get; set; }
}

/// <summary>
/// Defines the setup configuration for an AI persona,
/// including its identity, behavioral traits, knowledge base, and communication abilities.
/// </summary>
public class ConversationModelSetupDto
{
    // Identity

    /// <summary>
    /// Gets or sets the display name of the persona.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the primary role or function of the persona (e.g., virtual assistant, language tutor).
    /// </summary>
    public required string RoleOrObjective { get; set; }

    /// <summary>
    /// Gets or sets the category or domain in which the persona operates (e.g., healthcare, finance, education).
    /// </summary>
    public required string CategoryOrDomain { get; set; }

    // Behavioral Settings

    /// <summary>
    /// Gets or sets the tone or communication style(s) the persona adopts (e.g., formal, friendly, professional).
    /// </summary>
    public required string ToneOfVoice { get; set; }

    /// <summary>
    /// Gets or sets the guidelines or behavioral instructions that define how the persona should respond or interact.
    /// </summary>
    public required string Instructions { get; set; }

    /// <summary>
    /// Gets or sets the restrictions or boundaries, outlining topics or actions the persona should avoid.
    /// </summary>
    public required string ExclusionsOrBoundaries { get; set; }

    // Knowledge Base & Context

    /// <summary>
    /// Gets or sets a list of document-specific instructions that shape the persona's knowledge and behavior.
    /// </summary>
    public List<ConversationModelDocumentInstruction>? Documents { get; set; }

    /// <summary>
    /// Gets or sets the time frame during which past interactions or context remain relevant to the persona's responses.
    /// </summary>
    public required string ContextMemoryTimeframe { get; set; }

    // Communication Capabilities

    /// <summary>
    /// Gets or sets the specific speech configuration for the conversational model.
    /// </summary>
    public required SpeechConfigurationDto SpeechConfiguration { get; set; }
}

/// <summary>
/// Provides instructions for handling documents associated with the AI persona,
/// including how they should influence its behavior or knowledge.
/// </summary>
public class ConversationModelDocumentInstruction
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
    /// Gets or sets the name of the document associated with the persona.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets any specific instructions for how the document should influence the persona’s behavior.
    /// </summary>
    public string? Instructions { get; set; }
}

/// <summary>
/// Represents the configuration for speech settings,
/// including language, voice, and speech-to-text/text-to-speech options.
/// </summary>
public class SpeechConfigurationDto
{
    /// <summary>
    /// Gets or sets the speech configuration type for the conversational model.
    /// </summary>
    public required SpeechConfigurationTypesEnum ConfigurationType { get; set; }

    /// <summary>
    /// Gets or sets the language code (e.g., "en" for English).
    /// </summary>
    public required string Language { get; set; }

    /// <summary>
    /// Gets or sets the voice used for text-to-speech.
    /// </summary>
    public string? Voice { get; set; }

    /// <summary>
    /// Gets or sets the text-to-speech configuration, which may be empty if not defined.
    /// </summary>
    public string? TextToSpeech { get; set; }

    /// <summary>
    /// Gets or sets the speech-to-text configuration, which may be empty if not defined.
    /// </summary>
    public string? SpeechToText { get; set; }
}
