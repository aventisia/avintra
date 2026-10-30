namespace GlobalAdminAPIs.Enums;

/// <summary>
/// Represents the types of on-premises instances.
/// </summary>
public enum OnPremInstanceTypesEnum
{
    /// <summary>
    /// Indicates a production instance.
    /// This type represents the live environment used by end-users.
    /// </summary>
    [Description("Production Instance - Live environment used by end-users")]
    Prod,

    /// <summary>
    /// Indicates a non-production instance.
    /// This type is typically used for development, testing, or staging environments.
    /// </summary>
    [Description("Non-Production Instance - Used for development, testing, or staging")]
    NonProd
}