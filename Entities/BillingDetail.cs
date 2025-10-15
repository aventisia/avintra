namespace AccountsAPIs.Entities;

public class BillingDetail : BaseEntity
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the email address for billing communications with the tenant.
    /// </summary>
    public string? BillingEmail { get; set; }

    /// <summary>
    /// Gets or sets the contact person phone number for the tenant.
    /// </summary>
    public string? ContactPerson { get; set; }

    /// <summary>
    /// Gets or sets the first line of the billing address.
    /// </summary>
    public required string AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the second line of the billing address (optional).
    /// </summary>
    public string? AddressLine2 { get; set; }

    /// <summary>
    /// Gets or sets the city of the billing address.
    /// </summary>
    public required string City { get; set; }

    /// <summary>
    /// Gets or sets the postal code of the billing address.
    /// </summary>
    public required string PostalCode { get; set; }

    /// <summary>
    /// Gets or sets the state or province of the billing address.
    /// </summary>
    public required string State { get; set; }

    /// <summary>
    /// Gets or sets the country of the billing address.
    /// </summary>
    public required CountriesEnum Country { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tenant is willing to file GST.
    /// </summary>
    public bool IsWillingToFileGst { get; set; }

    /// <summary>
    /// Gets or sets the GST number, if applicable.
    /// </summary>
    public string? GstNumber { get; set; }

    /// <summary>
    /// Gets or sets the currency for the billing transaction.
    /// </summary>
    public required CurrencyTypesEnum Currency { get; set; }

    /// <summary>
    /// Gets or sets the total billing amount, including applicable taxes.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay payment ID associated with the billing.
    /// </summary>
    public string? RazorpayPaymentId { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay order ID associated with the billing.
    /// </summary>
    public string? RazorpayOrderId { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay invoice ID associated with the billing.
    /// </summary>
    public string? RazorpayInvoiceId { get; set; }

    /// <summary>
    /// Gets or sets the payment status for the billing. Possible values: Created, Authorized, Captured, Refunded, Failed.
    /// </summary>
    public PaymentStatusTypesEnum PaymentStatus { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the subscription associated with this billing.
    /// </summary>
    public Guid SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the tenant's subscription associated with this billing.
    /// </summary>
    [ForeignKey("SubscriptionId")]
    public virtual TenantSubscription? TenantSubscription { get; set; }
}
