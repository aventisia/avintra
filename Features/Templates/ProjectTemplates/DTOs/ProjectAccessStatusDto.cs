namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents access settings for a project or resource, including its visibility and template approval status.
/// </summary>
public class ProjectAccessStatusDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the project template.
    /// </summary>
    public required Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the access level of the project or resource (e.g., Public, Tenant, Space).
    /// </summary>
    public TemplateAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project has been approved to be used as a template.
    /// </summary>
    public bool IsApprovedTemplate { get; set; }
}

/// <summary>
/// DTO for requesting LLM-generated documentation or instructions for a project template flow.
/// </summary>
public class GenereateProjectInstructionRequestDto
{
    /// <summary>
    /// Gets or sets the payload containing the serialized project template flow data to be sent to the LLM.
    /// This data is used as context for generating meaningful documentation or usage instructions.
    /// </summary>
    public required string Payload { get; set; }
}
