namespace AspNetToolkit.Enums;

/// <summary>
/// List of roles which user can have. Since this data will rarely change, we are keeping copies of this on the front-end and back-end to avoid API calls.
/// Any modification to this list will impact the following places:
/// - Front-end userRole list
/// - Database table of roles and M2M relationship of users-roles
/// - All the endpoints and UI components where user roles are required to restrict the usage.
/// </summary>
/// <remarks>
/// IMPORTANT NOTE 1: DO NOT REMOVE the semicolon from the description as it is being used here to split the description attribute value. 
/// </remarks>
public enum CustomRolesEnum
{
    /// <summary>
    /// Super administrator. This role has full access to all system features.
    /// </summary>
    [Description("0; Super administrator; This role has full access to all system features.")]
    SA,


    /// <summary>
    /// Tenant Administrator. This role manages users, settings, and data for one specific tenant only.
    /// </summary>
    [Description("1; Tenant Administrator; This role manages users, settings, and data for one specific tenant only.")]
    TA,

    /// <summary>
    /// Orchestrator Manager. This role handles workflows, automation, and operations for a single tenant.
    /// </summary>
    [Description("2; Orchestrator Manager; This role handles workflows, automation, and operations for a single tenant.")]
    OM,

    /// <summary>
    /// Tenant User. This role allows basic access to use the system within a specific tenant.
    /// </summary>
    [Description("3; Tenant User; This role allows basic access to use the system within a specific tenant.")]

    TU
}