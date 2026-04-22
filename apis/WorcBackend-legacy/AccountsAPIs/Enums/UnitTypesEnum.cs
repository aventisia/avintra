namespace AccountsAPIs.Enums;

/// <summary>
/// Defines the various unit types used in credit-based pricing plans.
/// </summary>
public enum UnitTypesEnum
{
    /// <summary>
    /// Unit is measured in seconds.
    /// </summary>
    [Description("Seconds")]
    Seconds,

    /// <summary>
    /// Unit is measured in tokens.
    /// </summary>
    [Description("Tokens")]
    Tokens,

    /// <summary>
    /// Unit is measured in transactions.
    /// </summary>
    [Description("Transactions")]
    Transactions,

    /// <summary>
    /// Unit is measured in messages.
    /// </summary>
    [Description("Message")]
    Message,

    /// <summary>
    /// Unit is measured in emails.
    /// </summary>
    [Description("Emails")]
    Email,

    /// <summary>
    /// Unit is measured in characters.
    /// </summary>
    [Description("Characters")]
    Characters,
}