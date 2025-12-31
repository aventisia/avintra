namespace AccountsAPIs.Enums;

/// <summary>
/// Specifies the network provider of the card used for the payment transaction.
/// </summary>
public enum CardNetworkTypesEnum
{
    /// <summary>
    /// Visa card network (internationally accepted credit and debit cards).
    /// </summary>
    [Description("Visa - International card network")]
    Visa,

    /// <summary>
    /// MasterCard card network (global credit and debit card provider).
    /// </summary>
    [Description("MasterCard - Global card provider")]
    MasterCard,

    /// <summary>
    /// RuPay card network (India’s domestic card scheme by NPCI).
    /// </summary>
    [Description("RuPay - India’s domestic card network")]
    RuPay,

    /// <summary>
    /// American Express (Amex) card network.
    /// </summary>
    [Description("Amex - American Express card network")]
    Amex,

    /// <summary>
    /// Discover card network (mainly used in the United States).
    /// </summary>
    [Description("Discover - US-based card network")]
    Discover,

    /// <summary>
    /// Any other or unrecognized card network.
    /// </summary>
    [Description("Other - Unlisted or custom card network")]
    Other
}
