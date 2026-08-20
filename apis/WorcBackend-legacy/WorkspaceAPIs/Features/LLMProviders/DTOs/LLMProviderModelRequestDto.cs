namespace WorkspaceAPIs.DTOs;

public class LLMProviderModelRequestDto
{
    /// <summary>
    /// Gets or sets the provider type from which models will be fetched.
    /// The provider can be one of several types, such as OpenRouter, Gemini, or OpenAI.
    /// </summary>
    public LLMProviderTypesEnum ProviderType { get; set; }

    /// <summary>
    /// Gets or sets the name of the credential associated with the external provider's API.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets the credential identifier (name) associated with the external provider's API.
    /// Accepted as an alias for <see cref="CredentialName"/> so callers that pass the stored
    /// credential name via <c>credentialId</c> (the credential-name plan) still resolve correctly.
    /// </summary>
    public string? CredentialId { get; set; }

    /// <summary>
    /// Optional output modalities (e.g., text, image, audio, embeddings) supported or requested for the model.
    /// </summary>
    public string? OutputModalities { get; set; }
}
