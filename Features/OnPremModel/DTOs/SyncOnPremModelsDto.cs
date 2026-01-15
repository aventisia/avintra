namespace WorkspaceAPIs.DTOs;

/// <summary>
/// DTO for syncing OnPrem models with an external provider.
/// </summary>
public class SyncOnPremModelsDto
{
    /// <summary>
    /// Gets or sets the type of provider to sync models from (e.g., Ollama).
    /// </summary>
    public OnPremModelProviderEnum ProviderType { get; set; }

    /// <summary>
    /// Gets or sets the base URL of the external provider's API used to fetch models.
    /// </summary>
    public required string ProviderUrl { get; set; }
}
