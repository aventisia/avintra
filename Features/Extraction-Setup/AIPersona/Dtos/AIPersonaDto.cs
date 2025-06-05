namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents the configuration and metadata for an AI persona, including setup details and audit information.
/// </summary>
public class AIPersonaDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the AI persona configuration.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the configuration settings for the persona. Optional.
    /// </summary>
    public AIPersonaSetupDto? SetupObject { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the persona was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the persona configuration.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who last modified the persona configuration.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user who created the persona configuration.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the persona configuration.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}

/// <summary>
/// Defines the AI persona’s identity, behavior, domain, communication abilities, and configuration options.
/// </summary>
public class AIPersonaSetupDto
{
    // Identity

    /// <summary>
    /// Gets or sets the display name of the persona.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the primary role or intended function of the persona (e.g., language tutor, virtual assistant).
    /// </summary>
    public required string RoleOrObjective { get; set; }

    /// <summary>
    /// Gets or sets the category or domain in which the persona operates (e.g., healthcare, finance, education).
    /// </summary>
    public required string CategoryOrDomain { get; set; }

    // Behavioral Settings

    /// <summary>
    /// Gets or sets the tone(s) or voice styles for the persona (e.g., formal, friendly, professional).
    /// </summary>
    public required string ToneOfVoice { get; set; }

    /// <summary>
    /// Gets or sets the instructions for how the persona should behave or respond.
    /// </summary>
    public required string Instructions { get; set; }

    /// <summary>
    /// Gets or sets the exclusions or boundaries to prevent the persona from discussing or acting on certain topics.
    /// </summary>
    public required string ExclusionsOrBoundaries { get; set; }

    // Knowledge Base & Context

    /// <summary>
    /// Gets or sets the list of document-specific instructions that influence the persona's behavior or knowledge.
    /// </summary>
    public List<DocumentInstruction>? Documents { get; set; }

    /// <summary>
    /// Gets or sets the timeframe for context retention and memory. Defines how long past interactions remain relevant.
    /// </summary>
    public required string ContextMemoryTimeframe { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for creativity and randomness in the persona’s responses.
    /// </summary>
    public required double Temperature { get; set; }

    /// <summary>
    /// Specifies the type or identifier of the large language model (LLM) being used.
    /// </summary>
    public string? LLM { get; set; }

    // Communication Capabilities

    /// <summary>
    /// Gets or sets a value indicating whether audio communication is enabled for the persona.
    /// </summary>
    public bool EnableAudio { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether video communication is supported for the persona.
    /// </summary>
    public bool EnableVideo { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether text-based chat communication is enabled for the persona.
    /// </summary>
    public bool EnableChat { get; set; }

}

/// <summary>
/// Defines specific handling instructions for documents associated with an AI persona.
/// </summary>
public class DocumentInstruction
{

    /// <summary>
    /// Gets or sets the path of uploaded file. 
    /// </summary>
    public required string FilePath { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the uploaded file.
    /// </summary>
    public required Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the document being referenced for the persona.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets any custom instructions related to the document that affect the persona's behavior.
    /// </summary>
    public string? Instructions { get; set; }
}
