namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents access settings for a project or resource, including its visibility and template approval status.
/// </summary>
public class ProjectAccessStatusDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the project template.
    /// </summary>
    public Guid? Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the project template. Limited to 255 characters.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the current approval status of the project template, such as Approved, Rejected, or Pending Approval.
    /// </summary>
    public ProjectTemplateStatusesEnum? Status { get; set; }

    /// <summary>
    /// Gets or sets the type or structure of the template (e.g., Block, Agent).
    /// </summary>
    public ProjectTemplateTypesEnum? Type { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the project template.
    /// </summary>
    public required Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the access level of the project or resource (e.g., Public, Tenant, Space).
    /// </summary>
    public TemplateAccessTypesEnum? AccessType { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project has been approved to be used as a template.
    /// </summary>
    public bool IsApprovedTemplate { get; set; } = false;
}

/// <summary>
/// DTO for requesting LLM-generated documentation or instructions for a project template flow.
/// </summary>
public class GenereateProjectInstructionRequestDto
{
    /// <summary>
    /// Gets or sets the type of the entity or operation the credits were used for (e.g., Agent, Model).
    /// </summary>
    public UsageSourceTypesEnum RefType { get; set; }

    /// <summary>
    /// Gets or sets the target of the prompt-generation request. Defaults to a project template.
    /// </summary>
    public PromptGenerationTargetsEnum PromptTarget { get; set; } = PromptGenerationTargetsEnum.Template;

    /// <summary>
    /// Gets or sets the identifier of the specific reference associated with the usage context (e.g., AgentId, ModelId).
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the display name or description of the reference entity associated with the usage.
    /// </summary>
    public required string RefName { get; set; }

    /// <summary>
    /// Gets or sets the payload containing the serialized project template flow data to be sent to the LLM.
    /// This data is used as context for generating meaningful documentation or usage instructions.
    /// </summary>
    public required string Payload { get; set; }
}
