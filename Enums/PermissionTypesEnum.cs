namespace AspNetToolkit.Enums;

/// <summary>
/// Lists the various types of permissions supported by the system.
/// </summary>
public enum PermissionTypesEnum
{
    /// <summary>
    /// Represents user roles in the system.
    /// </summary>
    [Description("0; Roles; Represents user roles in the system.")]
    Roles,

    /// <summary>
    /// Represents project-related data.
    /// </summary>
    [Description("1; Projects; Represents project-related data.")]
    Projects,

    /// <summary>
    /// Represents reusable templates for various modules.
    /// </summary>
    [Description("2; Templates; Represents reusable templates for various modules.")]
    Templates,

    /// <summary>
    /// Represents client data and related access.
    /// </summary>
    [Description("3; Clients; Represents client data and related access.")]
    Clients,

    /// <summary>
    /// Manages agent-related permissions and data.
    /// </summary>
    [Description("4; Agents Manager; Manages agent-related permissions and data.")]
    AgentsManager,

    /// <summary>
    /// Manages user accounts and roles.
    /// </summary>
    [Description("5; User Manager; Manages user accounts and roles.")]
    UserManager,

    /// <summary>
    /// Handles billing and payment-related access.
    /// </summary>
    [Description("6; Billing Manager; Handles billing and payment-related access.")]
    BillingManager,

    /// <summary>
    /// Manages tenant-specific configurations and data.
    /// </summary>
    [Description("7; Tenant Manager; Manages tenant-specific configurations and data.")]
    TenantManager
}