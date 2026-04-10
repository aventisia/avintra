namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the response returned after generating embeddings,
/// including metadata such as execution time, token usage, and status.
/// </summary>
public class EmbeddingResponseDto
{
    /// <summary>
    /// Gets or sets the provider used to generate embeddings.
    /// </summary>
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the model used to generate embeddings.
    /// </summary>
    [JsonPropertyName("model")]
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the collection of embedding vectors, one per input item.
    /// </summary>
    [JsonPropertyName("embeddings")]
    public List<List<float>> Embeddings { get; set; } = new();

    /// <summary>
    /// Gets or sets the timestamp indicating when the response was created (UTC).
    /// </summary>
    [JsonPropertyName("created_on")]
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the total time taken to generate embeddings, in seconds.
    /// </summary>
    [JsonPropertyName("time_taken")]
    public double? TimeTaken { get; set; } = 0.0;

    /// <summary>
    /// Gets or sets a value indicating whether BYOK authentication was used.
    /// </summary>
    [JsonPropertyName("is_byok_enabled")]
    public bool? IsByokEnabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the identifier of the credential used (if applicable).
    /// </summary>
    [JsonPropertyName("credential_id")]
    public string? CredentialId { get; set; }

    /// <summary>
    /// Gets or sets the total number of tokens processed during embedding generation.
    /// </summary>
    [JsonPropertyName("input_tokens")]
    public int? InputTokens { get; set; } = 0;

    /// <summary>
    /// Gets or sets the execution status of the embedding request ("completed" or "failed").
    /// </summary>
    [JsonPropertyName("status")]
    public string Status { get; set; } = "completed";

    /// <summary>
    /// Gets or sets the error message if the embedding process failed; otherwise null.
    /// </summary>
    [JsonPropertyName("error")]
    public string? Error { get; set; }
}