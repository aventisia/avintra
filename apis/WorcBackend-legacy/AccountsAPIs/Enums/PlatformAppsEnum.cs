namespace AccountsAPIs.Enums;

/// <summary>
/// List of platform apps that share the accounts user management and JWT.
/// Every role in the Roles table belongs to exactly one app via its AppCode
/// (the lowercase name of this enum), so each app's user management only lists
/// its own roles. JWTs still carry all roles of a user regardless of app.
/// </summary>
public enum PlatformAppsEnum
{
    /// <summary>
    /// The workspace app (app A).
    /// </summary>
    Workspace,

    /// <summary>
    /// The CRM app (app B).
    /// </summary>
    CRM,
}