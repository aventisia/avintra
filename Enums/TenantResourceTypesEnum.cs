namespace AccountsAPIs.Enums;

/// <summary>
/// Defines the different types of tenant resource configurations within the system.
/// </summary>
public enum TenantResourceTypesEnum
{
    /// <summary>
    /// Indicates a shared tenant type, where multiple users share the same resources.
    /// </summary>
    [Description("Shared tenant type, where multiple users share the same resources.")]
    Shared,

    /// <summary>
    /// Indicates an on-premises tenant type, where resources are hosted locally.
    /// </summary>
    [Description("On-premises tenant type, where resources are hosted locally.")]
    OnPrem,

    /// <summary>
    /// Indicates a dedicated tenant type, where resources are allocated exclusively to a single user or organization.
    /// </summary>
    [Description("Dedicated tenant type, where resources are allocated exclusively to a single user or organization.")]
    Dedicated,
}
