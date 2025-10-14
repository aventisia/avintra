namespace AccountsAPIs.Enums;

/// <summary>
/// Enum representing different payment statuses.
/// </summary>
public enum PaymentStatusTypesEnum
{
    /// <summary>
    /// Payment has been created but not yet authorized.
    /// </summary>
    [Description("Payment has been created but not yet authorized.")]
    Created,

    /// <summary>
    /// Payment has been authorized, but not yet captured.
    /// </summary>
    [Description("Payment has been authorized, but not yet captured.")]
    Authorized,

    /// <summary>
    /// Payment has been successfully captured.
    /// </summary>
    [Description("Payment has been successfully captured.")]
    Captured,

    /// <summary>
    /// Payment has been refunded.
    /// </summary>
    [Description("Payment has been refunded.")]
    Refunded,

    /// <summary>
    /// Payment failed during processing.
    /// </summary>
    [Description("Payment failed during processing.")]
    Failed
}