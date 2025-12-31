namespace AccountsAPIs.Enums;

/// <summary>
/// Specifies the type of card used in a payment transaction.
/// </summary>
public enum CardTypesEnum
{
    /// <summary>
    /// Credit card allowing purchases on credit with repayment later.
    /// </summary>
    [Description("Credit Card - allows borrowing funds for purchases")]
    Credit,

    /// <summary>
    /// Debit card linked directly to a bank account for immediate funds deduction.
    /// </summary>
    [Description("Debit Card - deducts funds directly from bank account")]
    Debit,

    /// <summary>
    /// Prepaid card loaded with a fixed amount before use.
    /// </summary>
    [Description("Prepaid Card - pre-loaded with funds for spending")]
    Prepaid,

    /// <summary>
    /// Other types of cards not covered by the above categories.
    /// </summary>
    [Description("Other - card types not listed above")]
    Other
}