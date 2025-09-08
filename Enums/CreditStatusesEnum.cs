namespace AccountsAPIs.Enums;

/// <summary>
/// Enum representing the possible statuses of a tenant's credit.
/// </summary>
public enum CreditStatusesEnum
{
    /// <summary>
    /// Indicates that the credit is available to be used by the tenant.
    /// </summary>
    [Description("Credit is available to be used.")]
    Available,

    /// <summary>
    /// Indicates that the credit has been fully used by the tenant.
    /// </summary>
    [Description("Credit has been used.")]
    Used,

    /// <summary>
    /// Indicates that the credit has expired and is no longer available for use.
    /// </summary>
    [Description("Credit has expired and can no longer be used.")]
    Expired
}