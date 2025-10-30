namespace AccountsAPIs.Entities;

/// <summary>
/// Represents the history of billing transactions for a tenant, including payment details, status, and related subscription.
/// </summary>
public class BillingHistory : BaseEntity
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, used for multi-tenancy filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the currency used for the billing transaction.
    /// </summary>
    public required CurrencyTypesEnum Currency { get; set; }

    /// <summary>
    /// Gets or sets the total amount billed, including applicable taxes.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay payment ID associated with this billing transaction.
    /// </summary>
    public string? RazorpayPaymentId { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay order ID associated with this billing transaction.
    /// </summary>
    public string? RazorpayOrderId { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay invoice ID associated with this billing transaction.
    /// </summary>
    public string? RazorpayInvoiceId { get; set; }

    /// <summary>
    /// Gets or sets the payment status for this billing transaction. Possible values include: Created, Authorized, Captured, Refunded, Failed.
    /// </summary>
    public PaymentStatusTypesEnum PaymentStatus { get; set; }

    /// <summary>
    /// Gets or sets the link to the generated invoice for this billing transaction.
    /// </summary>
    public string? InvoiceLink { get; set; }

    /// <summary>
    /// Gets or sets the type of credit allocated to the tenant (e.g., Subscription, Top-up, Addon).
    /// </summary>
    public CreditTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the quantity (number of credits) allocated in this billing transaction.
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the subscription associated with this billing history.
    /// </summary>
    public Guid BillingDetailId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the related billing detail for this transaction.
    /// </summary>
    [ForeignKey("BillingDetailId")]
    public virtual BillingDetail? BillingDetail { get; set; }
}