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
    [Description("1; Tenant administrator; This role manages users, settings, and data for one specific tenant only.")]
    TA,

    /// <summary>
    /// Orchestrator Manager. This role handles workflows, automation, and operations for a single tenant.
    /// </summary>
    [Description("2; Orchestrator manager; This role handles workflows, automation, and operations for a single tenant.")]
    OM,

    /// <summary>
    /// Developer. This role is for users who can create, manage, and develop automation agents within a specific tenant.
    /// </summary>
    [Description("3; Developer; This role is for users who can create, manage, and develop automation agents within a specific tenant.")]
    TD,

    /// <summary>
    /// User. This role is for users who interact with and utilize automation agents, but do not have permissions to develop or manage workflows.
    /// </summary>
    [Description("4; User; This role is for users who interact with and utilize automation agents, but do not have permissions to develop or manage workflows.")]
    TU,

    // ---------------------------------- CRM APP ROLES --------------------------------

    // NOTE: Sequence is per app. The workspace roles above start at 0 and the CRM roles
    // below restart at 0. Each app has its own privilege hierarchy where 0 is the highest
    // privilege. The CRM roles are seeded with AppCode "crm" (see PlatformAppRoleMap) so
    // the workspace user management never lists them.

    /// <summary>
    /// CRM Super Admin. This role has full access to all features of the CRM app.
    /// </summary>
    [Description("0; Super admin; This role has full access to all features of the CRM app.")]
    CSA,


    /// <summary>
    /// CRM Tenant Admin. This role manages users, settings, and data for one specific tenant in the CRM app.
    /// </summary>
    [Description("1; Tenant admin; This role manages users, settings, and data for one specific tenant in the CRM app.")]
    CTA,

    /// <summary>
    /// CRM Sales Representative. This role is for users who manage CRM records such as leads, deals, and customers.
    /// </summary>
    [Description("2; Sales representative; This role is for users who manage CRM records such as leads, deals, and customers.")]
    CSR,

    /// <summary>
    /// CRM Referral Partner. This role is for partners who refer customers to the CRM app.
    /// </summary>
    [Description("3; Referral partner; This role is for partners who refer customers to the CRM app.")]
    CRP,
}