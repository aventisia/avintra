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
