namespace AccountsAPIs.DTOs;

/// <summary>
/// Tracks the status and progress of a payment or subscription.
/// </summary>
public class PaymentTrackerDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the payment has been initiated.
    /// </summary>
    public bool IsInitiated { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the payment has been collected.
    /// </summary>
    public bool IsCollected { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether billing information has been created.
    /// </summary>
    public bool IsBillingCreated { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the subscription has been updated.
    /// </summary>
    public bool IsSubscribed { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the customer's credit has been updated.
    /// </summary>
    public bool IsCreditUpdated { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay payment ID.
    /// </summary>
    public string? RazorpayPaymentId { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay order ID.
    /// </summary>
    public string? RazorpayOrderId { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay subscription ID.
    /// </summary>
    public string? RazorpaySubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets an optional description for additional details or notes related to the payment.
    /// </summary>
    public string? Description { get; set; }
}