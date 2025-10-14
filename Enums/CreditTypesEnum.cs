namespace AccountsAPIs.Enums;

/// <summary>
/// Enum to represent different types of credits allocated to a tenant.
/// </summary>
public enum CreditTypesEnum
{
    /// <summary>
    /// Credit allocated for the subscription (e.g., monthly or yearly).
    /// </summary>
    [Description("Credit allocated for the subscription (e.g., monthly or yearly).")]
    Subscription,

    /// <summary>
    /// Top-up or recharge credit that can be added to the tenant's account.
    /// </summary>
    [Description("Top-up or recharge credit that can be added to the tenant's account.")]
    TopUp,

    /// <summary>
    /// Add-on credit, typically for extra features or services.
    /// </summary>
    [Description("Add-on credit, typically for extra features or services.")]
    Addon
}
