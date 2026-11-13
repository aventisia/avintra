namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to build a binary office file from a spec block.
/// </summary>
public class GenerateFromSpecDto
{
    /// <summary>
    /// Gets or sets the ID of the conversation this artifact belongs to.
    /// </summary>
    [RequiredGuid]
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the fenced spec block (doc-spec, sheet-spec or slide-spec) to synthesize.
    /// </summary>
    public required string Spec { get; set; }
}
