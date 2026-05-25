/// <summary>
/// Represents a response that contains a collection of available models.
/// </summary>
public class OllamaModelResponse
{
    /// <summary>
    /// Gets or sets the list of available models with their details.
    /// </summary>
    public List<ModelDetails> Models { get; set; } = new List<ModelDetails>();
}

/// <summary>
/// Represents detailed metadata for a specific model.
/// </summary>
public class ModelDetails
{
    /// <summary>
    /// Gets or sets the display name of the model.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the name of the model.
    /// </summary>
    public string? Model { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the model.
    /// </summary>
    public string? Identifier { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the model was last modified.
    /// </summary>
    public DateTime LastModified { get; set; }

    /// <summary>
    /// Gets or sets the size of the model in bytes.
    /// </summary>
    public long SizeInBytes { get; set; }

    /// <summary>
    /// Gets or sets the digest (hash) of the model.
    /// </summary>
    public string? Digest { get; set; }

    /// <summary>
    /// Gets or sets the format of the model (e.g., GGUF).
    /// </summary>
    public string? Format { get; set; }

    /// <summary>
    /// Gets or sets the family of the model.
    /// </summary>
    public string? Family { get; set; }

    /// <summary>
    /// Gets or sets the list of families the model belongs to.
    /// </summary>
    public List<string> Families { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the parameter size of the model (e.g., 9B).
    /// </summary>
    public string? ParameterSize { get; set; }

    /// <summary>
    /// Gets or sets the quantization level of the model (e.g., Q4_0).
    /// </summary>
    public string? QuantizationLevel { get; set; }

    /// <summary>
    /// Gets or sets the expiration date and time of the model.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the VRAM size used by the model.
    /// </summary>
    public long SizeVRAM { get; set; }
}
