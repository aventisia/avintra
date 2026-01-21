namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the various providers for the OnPrem models.
/// </summary>
public enum OnPremModelProviderEnum
{
    /// <summary>
    /// Represents the Ollama model provider.
    /// </summary>
    [Description("Ollama Model Provider")]
    Ollama,

    /// <summary>
    /// TODO: Add other model providers (e.g., providers from different platforms or systems).
    /// This will allow support for additional models and flexibility in the system.
    /// </summary>
    // TODO: Add support for additional model providers.
}
