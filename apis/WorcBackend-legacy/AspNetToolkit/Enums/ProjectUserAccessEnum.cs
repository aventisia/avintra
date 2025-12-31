namespace AspNetToolkit.Enums;

/// <summary>
/// Defines the different levels of access a user can have on a project.
/// </summary>
public enum ProjectUserAccessEnum
{
    /// <summary>
    /// Allows read-only project content except meta, but cannot manage ownership, delete, update, or share the project.
    /// </summary>
    View,

    /// <summary>
    /// Allows updating project content except meta data, but cannot manage ownership, delete, or share the project.
    /// </summary>
    Edit,

    /// <summary>
    /// Grants Full control, including modifying meta data, sharing, and deleting the project.
    /// </summary>
    Owner,
}