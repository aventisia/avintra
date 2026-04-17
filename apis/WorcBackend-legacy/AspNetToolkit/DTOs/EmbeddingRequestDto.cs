namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents a request to generate embeddings for one or more input texts
/// using a specified AI provider and model configuration.
/// </summary>
public class EmbeddingRequestDto
{
    /// <summary>
    /// Gets or sets the embedding provider (e.g., OpenAI, Azure, Gemini).
    /// </summary>
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the model name used to generate embeddings.
    /// </summary>
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the input text(s) to be embedded. Can be a single string or a list of strings.
    /// </summary>
    [JsonPropertyName("input")]
    public object Input { get; set; } = default!;

    /// <summary>
    /// Gets or sets the optional dimensionality of the output embedding vector (if supported by the provider).
    /// </summary>
    [JsonPropertyName("dimensions")]
    public int? Dimensions { get; set; }

    /// <summary>
    /// Gets or sets the format of the embedding output. Supported values: "float" or "base64". Default is "float".
    /// </summary>
    [JsonPropertyName("encoding_format")]
    public string EncodingFormat { get; set; } = "float";

    /// <summary>
    /// Gets or sets the optional identifier of the associated entity (e.g., document ID).
    /// </summary>
    [JsonPropertyName("reference_id")]
    public string? ReferenceId { get; set; }

    /// <summary>
    /// Gets or sets the type of the referenced entity (e.g., "document", "record").
    /// </summary>
    [JsonPropertyName("reference_type")]
    public string? ReferenceType { get; set; }

    /// <summary>
    /// Gets or sets the human-readable name of the referenced entity.
    /// </summary>
    [JsonPropertyName("reference_name")]
    public string? ReferenceName { get; set; }

    /// <summary>
    /// Gets or sets the context or action triggering the embedding request 
    /// (e.g., "AgentExecution", "AIModelExecution", "WorkflowExecution").
    /// </summary>
    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether Bring Your Own Key (BYOK) authentication is enabled.
    /// </summary>
    [JsonPropertyName("is_byok_enabled")]
    public bool IsByokEnabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the optional identifier of the credential used when BYOK is enabled.
    /// </summary>
    [JsonPropertyName("credential_id")]
    public string? CredentialId { get; set; }
}