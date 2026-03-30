namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Contains the webhook-specific configuration stored in the Trigger.Metadata JSON column.
/// </summary>
public class WebhookTriggerModel
{
    /// <summary>
    /// Gets or sets the SHA-256 hash of the generated API key. Never returned in responses.
    /// </summary>
    public string? ApiKeyHash { get; set; }

    /// <summary>
    /// Gets or sets the exact date and time the API key expires.
    /// </summary>
    public DateTimeOffset ApiKeyExpiry { get; set; }

    /// <summary>
    /// Gets or sets an optional JSON Schema string that incoming payloads are validated against.
    /// </summary>
    public string? ExpectedPayloadSchema { get; set; }

    /// <summary>
    /// Gets or sets an optional URL to POST the agent execution result to when the job completes.
    /// </summary>
    public string? CallbackUrl { get; set; }

    /// <summary>
    /// Gets or sets the plain-text API key. Populated ONLY on Create and RegenerateApiKey responses; null on all other reads.
    /// </summary>
    public string? ApiKey { get; set; }
}
