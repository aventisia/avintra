namespace AspNetToolkit.Enums;

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
    Commercial,

    /// <summary>
    /// Represents a community deployment: a single-tenant, self-hosted edition with no
    /// on-prem tenant credentials and no GlobalAdmin synchronization. Appended last to
    /// preserve the numeric values of existing members (the type is marshalled as an int).
    /// </summary>
    [Description("Community edition, a single-tenant self-hosted deployment.")]
    Community
}
