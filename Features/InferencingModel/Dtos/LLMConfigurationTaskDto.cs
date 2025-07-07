/// <summary>
/// Data Transfer Object (DTO) for representing LLM-based tasks. 
/// It includes configuration for the LLM's environment (On-Premises or Cloud), 
/// as well as prompt and creativity settings.
/// </summary>
public class LLMConfigurationTaskDto : ModelTypeTaskDto
{
    /// <summary>
    /// Specifies the deployment type of the LLM. 
    /// It can be either On-Premises or Cloud-based.
    /// </summary>
    public required LLMConfigurationTypesEnum ConfigurationType { get; set; }

    /// <summary>
    /// Contains prompt and creativity settings used to guide the LLM's responses. 
    /// This includes the prompt text and temperature for randomness control.
    /// </summary>
    public required AdvanceOptionsDto AdvanceOptions { get; set; }

    /// <summary>
    /// The identifier or name of the LLM. 
    /// </summary>
    public required string LLM { get; set; }

    /// <summary>
    /// Cloud-specific LLM settings, including the authentication secret key.
    /// This property is required when the LLM is Cloud-based.
    /// </summary>
    public SecretKeySettingDto? SecretKey { get; set; }
}

/// <summary>
/// DTO for Cloud-specific LLM settings, containing the secret key for 
/// authenticating to the cloud-based LLM service.
/// </summary>
public class SecretKeySettingDto
{
    /// <summary>
    /// The secret key or token used for authenticating to the cloud-based LLM service.
    /// </summary>
    [Required]
    public required string SecretKey { get; set; }
}

/// <summary>
/// DTO that represents the prompt and creativity settings for an LLM task.
/// It includes the prompt text and temperature setting for controlling randomness in LLM responses.
/// </summary>
public class AdvanceOptionsDto
{
    /// <summary>
    /// The prompt that directs the LLM to perform a specific task (e.g., summarization, data extraction).
    /// </summary>
    [Required]
    public required string NodePrompt { get; set; }

    /// <summary>
    /// The temperature setting for controlling the creativity and randomness of the LLM's responses. 
    /// A higher value makes the model more creative and diverse in its answers.
    /// </summary>
    [Required]
    public required double Temperature { get; set; }
}
