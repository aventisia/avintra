namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Contains the webhook-specific configuration stored in the Trigger.Metadata JSON column.
/// API key authentication is now handled by the centralized ApiKey entity, so per-trigger API key fields have been removed.
/// </summary>
public class WebhookTriggerModel
{
    /// <summary>
    /// Gets or sets an optional JSON Schema string that incoming payloads are validated against.
    /// </summary>
    public string? ExpectedPayloadSchema { get; set; }

    /// <summary>
    /// Gets or sets an optional URL to POST the agent execution result to when the job completes.
    /// </summary>
    public string? CallbackUrl { get; set; }
}
