namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the result of creating a Razorpay subscription,
/// including the Razorpay subscription ID and payment URL.
/// </summary>
public class RazorpaySubscriptionResult
{
    /// <summary>
    /// Gets or sets the Razorpay subscription ID.
    /// </summary>
    public string? RazorpaySubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay payment URL where the customer can complete the payment.
    /// </summary>
    public string? RazorpayPaymentUrl { get; set; }
}
