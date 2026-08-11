namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the audience scope of a manually created Notification. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum AudienceScopeEnum
{
    /// <summary>
    /// Represents delivery to all users in the target tenant(s).
    /// </summary>
    AllUsers,

    /// <summary>
    /// Represents delivery to a specific set of selected users.
    /// </summary>
    SelectedUsers,

    /// <summary>
    /// Represents delivery to all users holding the selected roles.
    /// </summary>
    SelectedRoles,

    /// <summary>
    /// Represents delivery to all users of selected tenant(s). This scope is only available to Super Admins.
    /// </summary>
    SelectedTenants
}
