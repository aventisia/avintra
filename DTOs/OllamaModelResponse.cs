/// <summary>
/// Represents a response that contains a collection of available AI models.
/// </summary>
public class OllamaModelResponse
{
    /// <summary>
    /// Gets or sets the list of available models with their details.
    /// </summary>
    public List<ModelDetails> Models { get; set; } = new List<ModelDetails>();
}

/// <summary>
/// Represents detailed metadata for a specific AI model.
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
}
