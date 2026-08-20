namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the request schema used to generate an LLM response.
/// This request contains all the information required to invoke the LLM for inference, including input, provider, and configuration settings.
/// </summary>
public class LLMRequest
{
    /// <summary>
    /// Gets or sets the LLM provider (e.g., OpenAI, Ollama, etc.).
    /// </summary>
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the model name used for the LLM request (e.g., "gpt-4").
    /// </summary>
    public required string Model { get; set; }

    /// <summary>
    /// Gets or sets the input to the LLM. It can either be a single string or a list of <see cref="LLMMessage"/> objects.
    /// </summary>
    public required object Input { get; set; }

    /// <summary>
    /// Gets or sets a list of base64-encoded files that can be used for OCR or text extraction during the LLM inference.
    /// </summary>
    public List<string>? Files { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the output should be extracted as JSON.
    /// </summary>
    public bool IsJsonOutput { get; set; }

    /// <summary>
    /// Gets or sets the JSON schema to be used for validating the LLM response.
    /// </summary>
    public object? JsonSchema { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of tokens allowed in the model output.
    /// </summary>
    public int? MaxOutputTokens { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether BYOK (Bring Your Own Key) is enabled for this request.
    /// </summary>
    public bool IsBYOKEnabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the credential NAME associated with BYOK (Bring Your Own Key) support.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for the LLM's randomness (between 0 and 1).
    /// </summary>
    public double Temperature { get; set; }

    /// <summary>
    /// Gets or sets the top-p (nucleus sampling) value for the LLM response generation.
    /// </summary>
    public double TopP { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the response is streamed in chunks.
    /// </summary>
    public bool Stream { get; set; } = false;

    /// <summary>
    /// Gets or sets the type of reference (e.g., "Agent", "Workflow") linking back to the source entity.
    /// </summary>
    public string? RefType { get; set; } // Type of the reference (e.g., "Agent", "Workflow")

    /// <summary>
    /// Gets or sets the unique identifier for the reference entity (e.g., Agent, Workflow).
    /// </summary>
    public string? RefId { get; set; }

    /// <summary>
    /// Gets or sets the name of the reference entity (e.g., name of the Agent, Workflow).
    /// </summary>
    public string? RefName { get; set; }

    /// <summary>
    /// Gets or sets the action being performed (e.g., "AgentExecution", "WorkflowExecution").
    /// </summary>
    public string? Action { get; set; }

    /// <summary>
    /// Gets or sets the name of the agent (optional).
    /// </summary>
    public string? AgentName { get; set; }
}

/// <summary>
/// Represents a message sent or received in an LLM-based conversation.
/// This structure defines the role of the sender and the content of the message.
/// </summary>
public class LLMMessage
{
    /// <summary>
    /// Gets or sets the role of the message sender (e.g., "system", "developer", "user", "assistant", "model").
    /// </summary>
    public required string Role { get; set; }

    /// <summary>
    /// Gets or sets the content of the LLM message.
    /// </summary>
    public string Content { get; set; } = string.Empty;
}