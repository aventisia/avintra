namespace WorkspaceAPIs.Enums;

/// <summary>
/// Specifies the target of an LLM prompt-generation request.
/// </summary>
public enum PromptGenerationTargetsEnum
{
    /// <summary>
    /// Generates or refines a project template description or usage instruction.
    /// </summary>
    Template,

    /// <summary>
    /// Generates or refines a ChatAgent system prompt.
    /// </summary>
    ChatAgentSystemPrompt,

    /// <summary>
    /// Generates or refines the Goal/Role/Instructions block of a VoiceAgent.
    /// </summary>
    VoiceAgentSystemPrompt
}
