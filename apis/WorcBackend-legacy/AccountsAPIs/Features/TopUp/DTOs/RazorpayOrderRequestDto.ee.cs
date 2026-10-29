namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data required to process a order transaction.
/// </summary>
public class RazorpayOrderRequestDto
{
    /// <summary>
    /// Gets or sets the currency for the order (e.g., "USD", "INR").
    /// </summary>
    public required CurrencyTypesEnum Currency { get; set; }

    /// <summary>
    /// Gets or sets the number of credits to be added (e.g., 5000 credits).
    /// </summary>
    public required int Credits { get; set; }

    /// <summary>
    /// Gets or sets the total amount of money for the order (e.g., 10.00).
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether tax (e.g., GST) should be applied to the top-up amount.
    /// </summary>
    public bool IncludeTax { get; set; }

    /// <summary>
    /// Gets or sets the type of credit allocated to the tenant (e.g., Subscription, Top-up, Addon).
    /// </summary>
    public CreditTypesEnum Type { get; set; } = CreditTypesEnum.TopUp;

    /// <summary>
    /// Gets or sets the unique Razorpay ID associated with the top-up transaction.
    /// </summary>
    public string? RazorpayId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the subscription associated with this billing.
    /// </summary>
    public Guid? SubscriptionId { get; set; }
}