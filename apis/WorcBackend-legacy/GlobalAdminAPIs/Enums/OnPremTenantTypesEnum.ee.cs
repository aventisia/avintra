namespace GlobalAdminAPIs.Enums;

public enum OnPremTenantTypesEnum
{
    /// <summary>
    /// Represents an enterprise tenant, typically a large organization with complex needs.
    /// </summary>
    [Description("Enterprise tenant, usually a large organization with complex needs.")]
    Enterprise,

    /// <summary>
    /// Represents a commercial tenant, typically a smaller organization or business.
    /// </summary>
    [Description("Commercial tenant, typically a small to medium-sized business.")]
    Commercial
}
