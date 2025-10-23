namespace AccountsAPIs.DTOs;

/// <summary>
/// Tracks the status and progress of a payment or subscription, providing details for customer support and reporting.
/// </summary>
public class PaymentTrackerDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the payment has been initiated.
    /// </summary>
    public bool IsInitiated { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the payment has been successfully collected.
    /// </summary>
    public bool IsCollected { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the billing information has been created.
    /// </summary>
    public bool IsBillingCreated { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the customer's credit has been updated.
    /// </summary>
    public bool IsCreditUpdated { get; set; }

    /// <summary>
    /// Gets or sets the payment ID from Razorpay.
    /// </summary>
    public string? RazorpayPaymentId { get; set; }

    /// <summary>
    /// Gets or sets the order ID from Razorpay.
    /// </summary>
    public string? RazorpayOrderId { get; set; }

    /// <summary>
    /// Gets or sets the subscription ID from Razorpay.
    /// </summary>
    public string? RazorpaySubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets an optional description for additional details or notes related to the payment.
    /// </summary>
    public string? Description { get; set; }
}
