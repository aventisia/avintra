namespace WorkspaceAPIs.DTOs;

/// <summary>
/// An AI model used by the agent, resolved from the flow config at save-time,
/// enriched with a human-entered assessment.
/// </summary>
public class AiModelDto
{
    /// <summary>
    /// Model provider (e.g. OpenAI, Azure OpenAI).
    /// </summary>
    public string? Provider { get; set; }

    /// <summary>
    /// The model identifier.
    /// </summary>
    public string? Model { get; set; }

    /// <summary>
    /// The credential name referenced by the node.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Whether bring-your-own-key is enabled.
    /// </summary>
    public bool IsByokEnabled { get; set; }

    // ---- Resolved per-node context ----

    /// <summary>
    /// The name of the flow node that uses this model.
    /// </summary>
    public string? NodeName { get; set; }

    /// <summary>
    /// Knowledge bases linked to the node.
    /// </summary>
    public List<string> LinkedKnowledgeBases { get; set; } = new();

    /// <summary>
    /// Skills linked to the node.
    /// </summary>
    public List<string> LinkedSkills { get; set; } = new();

    /// <summary>
    /// Tools linked to the node.
    /// </summary>
    public List<string> LinkedTools { get; set; } = new();

    // ---- Human-entered assessment ----

    /// <summary>
    /// Per-model risk rating (low/medium/high).
    /// </summary>
    public string? RiskRating { get; set; }

    /// <summary>
    /// The type of the model (conversation/inferencing/generative).
    /// </summary>
    public string? ModelType { get; set; }

    /// <summary>
    /// Who consumes the model's output (multi-select).
    /// </summary>
    public List<string> OutputConsumedBy { get; set; } = new();

    /// <summary>
    /// Ongoing monitoring plan (e.g. drift/quality checks).
    /// </summary>
    public string? MonitoringPlan { get; set; }

    /// <summary>
    /// Allowed use cases / guardrails for this model.
    /// </summary>
    public string? UsageRestrictions { get; set; }

    /// <summary>
    /// Specific risks associated with this model.
    /// </summary>
    public string? Risks { get; set; }

    /// <summary>
    /// Mitigations for the above risks.
    /// </summary>
    public string? Mitigations { get; set; }
}
