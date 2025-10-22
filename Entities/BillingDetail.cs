namespace AccountsAPIs.Entities;

/// <summary>
/// Represents the billing details associated with a tenant subscription, including contact information, billing address, and GST-related data.
/// </summary>
public class BillingDetail : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, used for multi-tenancy filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the email address for billing-related communications with the tenant.
    /// </summary>
    public string? BillingEmail { get; set; }

    /// <summary>
    /// Gets or sets the contact phone number for the tenant's designated contact person.
    /// </summary>
    public string? ContactPerson { get; set; }

    /// <summary>
    /// Gets or sets the first line of the tenant's billing address.
    /// </summary>
    public required string AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the second line of the tenant's billing address (optional).
    /// </summary>
    public string? AddressLine2 { get; set; }

    /// <summary>
    /// Gets or sets the city in the tenant's billing address.
    /// </summary>
    public required string City { get; set; }

    /// <summary>
    /// Gets or sets the postal code in the tenant's billing address.
    /// </summary>
    public required string PostalCode { get; set; }

    /// <summary>
    /// Gets or sets the state or province in the tenant's billing address.
    /// </summary>
    public required string State { get; set; }

    /// <summary>
    /// Gets or sets the country in the tenant's billing address.
    /// </summary>
    public required CountriesEnum Country { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the tenant is willing to file GST.
    /// </summary>
    public bool IsWillingToFileGst { get; set; }

    /// <summary>
    /// Gets or sets the tenant's GST number, if applicable.
    /// </summary>
    public string? GstNumber { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the subscription associated with this billing.
    /// </summary>
    public Guid SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property for the tenant's subscription associated with this billing record.
    /// </summary>
    [ForeignKey("SubscriptionId")]
    public virtual TenantSubscription? TenantSubscription { get; set; }
}