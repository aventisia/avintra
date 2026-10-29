namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) for a task template, including details on the task's metadata, 
/// input and output settings, LLM provider configuration, and audit information.
/// </summary>
public class AITaskTableDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the task template.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the task. This is used to uniquely identify and reference the task within the system.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the system-level input prompt template for the task, providing context or instructions for the LLM to process.
    /// </summary>
    public string? SystemInput { get; set; }

    /// <summary>
    /// Gets or sets the user-level input prompt template, where dynamic user-provided data is injected for the task execution.
    /// </summary>
    public string? UserInput { get; set; }

    /// <summary>
    /// Gets or sets the name of the model provider (e.g., OpenAI, Anthropic, etc.) used for task execution.
    /// </summary>
    [MaxLength(255)]
    public required string ModelProvider { get; set; }

    /// <summary>
    /// Gets or sets the name of the model used by the LLM provider (e.g., GPT-4, Claude-2).
    /// </summary>
    [MaxLength(255)]
    public required string Model { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the LLM output should be returned in JSON format.
    /// </summary>
    public bool IsJsonOutput { get; set; }

    /// <summary>
    /// Gets or sets an optional JSON schema that defines the expected structure and validation rules for the JSON output, if applicable.
    /// </summary>
    public string? JsonSchema { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of tokens that the LLM is allowed to generate in the output. This limits the length of the model's response.
    /// </summary>
    public int MaxOutputTokens { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for the LLM. The temperature controls the randomness of the model's output; higher values result in more random responses.
    /// </summary>
    public float Temperature { get; set; }

    /// <summary>
    /// Gets or sets the top-p setting for the LLM, which controls the diversity of the model's output by considering only the top probabilities. The value ranges from 0.0 to 1.0.
    /// </summary>
    public float TopP { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the LLM's response should be streamed. Enabling streaming can reduce response time for larger outputs.
    /// </summary>
    public bool Stream { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// This property is nullable to differentiate between a true, false, or null value.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the task record. This field is for response purposes only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the task record was created.This field is for response purposes only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the task record. This field is for response purposes only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the task record was last modified. This field is for response purposes only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}