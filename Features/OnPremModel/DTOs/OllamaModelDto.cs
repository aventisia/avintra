namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a model from the Ollama provider.
/// </summary>
public class OllamaModelDto
{
    /// <summary>
    /// Gets or sets the name of the model.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the model identifier.
    /// </summary>
    public string? Model { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the last modified date and time of the model.
    /// </summary>
    public DateTime ModifiedAt { get; set; }

    /// <summary>
    /// Gets or sets the size of the model in bytes.
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Gets or sets the digest (checksum) of the model.
    /// </summary>
    public string Digest { get; set; } = string.Empty;
}

public class OllamaModelListResponse
{
    /// <summary>
    /// Gets or sets the list of models from Ollama.
    /// </summary>
    public List<OllamaModelDto> Models { get; set; } = new List<OllamaModelDto>();
}

