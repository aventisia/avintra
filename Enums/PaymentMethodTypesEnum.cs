namespace AccountsAPIs.Enums;

/// <summary>
/// Specifies the type of payment method used in a transaction.
/// </summary>
public enum PaymentMethodTypesEnum
{
    /// <summary>
    /// Payment made using a credit, debit, or prepaid card.
    /// </summary>
    [Description("Card - credit, debit, or prepaid card payments")]
    Card,

    /// <summary>
    /// Payment made using the Unified Payments Interface (UPI).
    /// </summary>
    [Description("UPI - Unified Payments Interface transactions")]
    Upi,

    /// <summary>
    /// Payment made using a digital wallet service.
    /// </summary>
    [Description("Wallet - digital wallet payments (e.g., Paytm, Amazon Pay)")]
    Wallet,

    /// <summary>
    /// Payment made via netbanking through bank websites or apps.
    /// </summary>
    [Description("Netbanking - online bank transfer payments")]
    Netbanking
}