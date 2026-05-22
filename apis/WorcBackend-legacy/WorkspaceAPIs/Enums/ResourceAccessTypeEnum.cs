namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the access levels that can be granted to a shared resource.
/// </summary>
public enum ResourceAccessTypeEnum
{
    /// <summary>
    /// Has ownership of the resource, including all permissions and the ability to manage access and transfer ownership.
    /// </summary>
    [Description("Has ownership of the resource, including all permissions and the ability to manage access and transfer ownership.")]
    Owner,

    /// <summary>
    /// Gets full control over the resource, including all available actions.
    /// </summary>
    [Description("Gets full control over the resource, including all available actions.")]
    FullAccess,

    /// <summary>
    /// Gets permission to view the resource without making changes.
    /// </summary>
    [Description("Gets permission to view the resource without making changes.")]
    View,

    /// <summary>
    /// Gets permission to create or add content within the resource.
    /// </summary>
    [Description("Gets permission to create or add content within the resource.")]
    Create,

    /// <summary>
    /// Gets permission to modify the resource or its content.
    /// </summary>
    [Description("Gets permission to modify the resource or its content.")]
    Edit,

    /// <summary>
    /// Gets permission to remove content or delete the resource.
    /// </summary>
    [Description("Gets permission to remove content or delete the resource.")]
    Delete
}