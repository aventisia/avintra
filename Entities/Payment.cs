namespace AccountsAPIs.Entities;

public class Payment : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the Id of a Invoice, this payment is associated with
    /// </summary>
    public Guid InvoiceId { get; set; }
    [ForeignKey("InvoiceId")]
    public virtual Invoice? Invoice { get; set; }

    /// <summary>
    /// Gets or sets the amountPaid
    /// </summary>
    public decimal AmountPaid { get; set; }

    /// <summary>
    /// Gets or sets the PaymentDate
    /// </summary>
    public DateTime PaymentDate { get; set; }

    /// <summary>
    /// Gets or sets the PaymentMethod
    /// </summary>
    public string? PaymentMethod { get; set; }

    /// <summary>
    /// Gets or sets the PaymentStatus
    /// </summary>
    public string? PaymentStatus { get; set; }

    public string? TransactionId {get;set;}
    public string? UTRNumber {get;set;}
    public string? UPIId {get;set;}
    public string? GatewayName { get; set; }

    // public string? Currency { get; set; }
    // public decimal? TaxAmount { get; set; }
    // public decimal? Discount { get; set; }
    // public string? CouponCode { get; set; }

}