namespace AccountsAPIs.DTOs;

public class PaymentMethodDto
{
    /// <summary>
    /// Gets or sets the unique payment identifier of the payment history.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay-assigned identifier for the saved or tokenized payment method.
    /// </summary>
    public string? RazorpayMethodId { get; set; }

    /// <summary>
    /// The name of the cardholder associated with the payment method.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the type of payment method (e.g., Card, UPI, Wallet).
    /// </summary>
    public PaymentMethodTypesEnum? Type { get; set; }

    /// <summary>
    /// Gets or sets the name of the digital wallet used (e.g., Paytm, AmazonPay). Only applicable when the method is <c>Wallet</c>.
    /// </summary>
    public string? Wallet { get; set; }

    /// <summary>
    /// Gets or sets the Virtual Payment Address (VPA) for UPI payments. Only applicable when the method is <c>UPI</c>.
    /// </summary>
    public string? Vpa { get; set; }

    /// <summary>
    /// Gets or sets the last four digits of the card used.
    /// </summary>
    public string? CardLast4 { get; set; }

    /// <summary>
    /// Gets or sets the card network (e.g., Visa, MasterCard).
    /// </summary>
    public CardNetworkTypesEnum? CardNetwork { get; set; }

    /// <summary>
    /// Gets or sets the type of card used (e.g., Credit, Debit).
    /// </summary>
    public CardTypesEnum? CardType { get; set; }

    /// <summary>
    /// Gets or sets the name of the card issuer (e.g., HDFC Bank, SBI).
    /// </summary>
    public string? CardIssuer { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the card is international.
    /// </summary>
    public bool CardInternational { get; set; }
}