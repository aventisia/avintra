namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents a DTO for configuring a conversational AI model task, including details about the model's behavior, configuration, and setup.
/// </summary>
public class ConversationalModelSetupDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the task.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the conversational model setup task.
    /// </summary>
    public string Name { get; set; } = "AIPersona";

    /// <summary>
    /// Indicates whether the on-premises LLM (Large Language Model) is used.
    /// </summary>
    /// <remarks>
    /// If <see cref="IsBYOKEnabled"/> is false, the cloud provider LLM will be utilized for this task.
    /// </remarks>
    public bool IsBYOKEnabled { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the credential (saved in vault).
    /// </summary>
    public Guid? CredentialId { get; set; }

    /// <summary>
    /// Gets or sets the node prompt to guide the model's behavior.
    /// </summary>
    public required string NodePrompt { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for the model's randomness.
    /// </summary>
    public required double Temperature { get; set; }

    /// <summary>
    /// Gets or sets the underlying model name (e.g., gpt-4o-mini).
    /// </summary>
    public required string Model { get; set; }

    /// <summary>
    /// Gets or sets the provider of the model (e.g., OpenAI, AzureOpenAI).
    /// </summary>
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether the model output should be in JSON format.
    /// </summary>
    public bool IsJsonOutput { get; set; }

    /// <summary>
    /// Gets or sets the nucleus sampling value (top-p).
    /// </summary>
    public double? TopP { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of tokens allowed in the model output.
    /// </summary>
    public int? MaxOutputToken { get; set; }
}