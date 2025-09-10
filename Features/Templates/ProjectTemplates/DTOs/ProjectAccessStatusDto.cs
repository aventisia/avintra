namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents access settings for a project or resource, including its visibility and template approval status.
/// </summary>
public class ProjectAccessDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the project template.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the access level of the project or resource (e.g., Public, Tenant, Space).
    /// </summary>
    public TemplateAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project has been approved to be used as a template.
    /// </summary>
    public bool IsApprovedTemplate { get; set; }
}
