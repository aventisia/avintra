namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Remembers the model, effort and web search of a landing conversation.
/// </summary>
public class UpdateConversationSettingsDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the conversation.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the LiteLLM provider of the model. Max-100 characters.
    /// </summary>
    [StringLength(100)]
    public string? ModelProvider { get; set; }

    /// <summary>
    /// Gets or sets the model. Max-255 characters.
    /// </summary>
    [StringLength(255)]
    public string? ModelId { get; set; }

    /// <summary>
    /// Gets or sets the reasoning effort. Max-20 characters.
    /// </summary>
    [StringLength(20)]
    public string? ReasoningEffort { get; set; }

    /// <summary>
    /// Gets or sets whether web search is enabled.
    /// </summary>
    public bool? WebSearch { get; set; }
}
