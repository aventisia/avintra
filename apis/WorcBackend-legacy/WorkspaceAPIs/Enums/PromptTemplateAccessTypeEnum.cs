namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the visibility scope of a prompt template.
/// Determines who can access and use the template.
/// </summary>
public enum PromptTemplateAccessTypeEnum
{
    /// <summary>
    /// Accessible only by the creator (owner).
    /// </summary>
    Self,

    /// <summary>
    /// Accessible within the same tenant/organization.
    /// </summary>
    Tenant,

    /// <summary>
    /// Accessible globally to all users.
    /// </summary>
    Public
}