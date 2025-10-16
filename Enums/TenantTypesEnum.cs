namespace AccountsAPIs.Enums;

/// <summary>
/// Represents the different types of tenants in the system.
/// </summary>
public enum TenantTypesEnum
{
    /// <summary>
    /// Represents an individual tenant type, where resources are allocated to a single user.
    /// </summary>
    [Description("Individual tenant type where resources are allocated to a single user.")]
    Individual,

    /// <summary>
    /// Represents an organization tenant type, where resources are allocated to a specific organization.
    /// </summary>
    [Description("Organization tenant type where resources are allocated to a specific organization.")]
    Organization,

    /// <summary>
    /// Represents a tenant type that has not been specified yet.
    /// </summary>
    [Description("Tenant type not yet specified.")]
    Unspecified,
}