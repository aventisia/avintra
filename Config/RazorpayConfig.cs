namespace AccountsAPIs.Config;

/// <summary>
/// Provides a strongly-typed representation of the configuration settings required for Razorpay integration.
/// </summary>
public class RazorpayConfig
{
    /// <summary>
    /// The public Key ID provided by Razorpay, used for identifying the merchant.
    /// </summary>
    [Required]
    public required string KeyId { get; set; }

    /// <summary>
    /// The private Key Secret provided by Razorpay, used for authenticating API requests.
    /// </summary>
    [Required]
    public required string KeySecret { get; set; }

    /// <summary>
    /// The secret used to verify the authenticity of incoming Razorpay webhooks.
    /// </summary>
    [Required]
    public required string WebhookSecret { get; set; }
}