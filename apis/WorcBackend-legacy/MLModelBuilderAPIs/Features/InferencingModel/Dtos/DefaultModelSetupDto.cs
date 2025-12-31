namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents a DTO for a general model inferencing task configuration.
/// </summary>
public class DefaultModelSetupDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the task.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the task.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the configuration type of the model.
    /// </summary>
    public required LLMConfigurationTypesEnum ConfigurationType { get; set; }

    /// <summary>
    /// Gets or sets the model type used.
    /// </summary>
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets the secret key string.
    /// </summary>
    public string? SecretKey { get; set; }

    /// <summary>
    /// Gets or sets the node prompt to guide the model's behavior.
    /// </summary>
    public required string NodePrompt { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for the model's randomness.
    /// </summary>
    public required double Temperature { get; set; }
}
