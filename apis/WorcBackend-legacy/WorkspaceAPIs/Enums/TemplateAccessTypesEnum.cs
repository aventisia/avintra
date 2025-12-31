namespace WorkspaceAPIs.Enums;

/// <summary>
/// Specifies the access levels available for a project template.
/// </summary>
public enum TemplateAccessTypesEnum
{
    /// <summary>
    /// Accessible only to users within the same tenant.
    /// </summary>
    TenantLevel,

    /// <summary>
    /// Accessible to all users, including those outside the organization.
    /// </summary>
    Public,

    /// <summary>
    /// Accessible only to users within a specific space.
    /// </summary>
    Space
}
