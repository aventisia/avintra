namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents a DTO for configuring a generative AI model task, including details about the model's behavior, configuration, and setup.
/// </summary>
public class GenerativeModelDefaultSetupDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the task.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the generative model setup task.
    /// </summary>
    public required GenerativeModelTypesEnum Name { get; set; }

    /// <summary>
    /// Gets or sets the configuration type of the generative model.
    /// </summary>
    public required LLMConfigurationTypesEnum ConfigurationType { get; set; }

    /// <summary>
    /// Gets or sets the node prompt used to guide the generative model's behavior.
    /// </summary>
    public required string NodePrompt { get; set; }

    /// <summary>
    /// Gets or sets the specific model used for the conversation (e.g., GPT-3, GPT-4).
    /// </summary>
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets the secret key string for securing API access or connections.
    /// </summary>
    public string? SecretKey { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting, controlling the randomness of the model's responses.
    /// </summary>
    public required double Temperature { get; set; }
}
