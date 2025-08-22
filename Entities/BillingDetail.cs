namespace AccountsAPIs.Entities;

public class BillingDetail : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the subscription frequency (e.g., monthly or yearly).
    /// </summary>
    public SubscriptionFrequenciesEnum Frequency { get; set; }

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
    /// Gets or sets the base subscription amount, excluding tax.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the tax rate as a percentage (e.g., 18 for 18%).
    /// </summary>
    public decimal TaxRate { get; set; } = 18;

    /// <summary>
    /// Gets or sets the ID of the assigned subscription plan.
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the subscription plan assigned to the tenant.
    /// </summary>
    [ForeignKey("PlanId")]
    public virtual SubscriptionPlan? Plan { get; set; }
}
