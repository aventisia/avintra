namespace AccountsAPIs.Entities;

public class Payment : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the Id of a billing detail, this payment is associated with
    /// </summary>
    public Guid BillingDetailId { get; set; }
    [ForeignKey("BillingDetailId")]
    public virtual BillingDetail? BillingDetail { get; set; }

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
    public PaymentMethodEnum PaymentMethod { get; set; }

    /// <summary>
    /// Gets or sets the PaymentStatus
    /// </summary>
    public PaymentStatusEnum PaymentStatus { get; set; }

    [MaxLength(20)]
    public string? TransactionId {get;set;}
    [MaxLength(20)]
    public string? UTRNumber {get;set;}
    
    [MaxLength(25)]
    public string? GatewayName { get; set; }

    // public string? Currency { get; set; }
    // public decimal? TaxAmount { get; set; }
    // public decimal? Discount { get; set; }
    // public string? CouponCode { get; set; }

}