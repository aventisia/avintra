namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the subscription details of a tenant, including the plan, active period, 
/// status, and audit-related metadata.
/// </summary>
public class TenantSubscriptionPurchaseDto
{
    /// <summary>
    /// Gets or sets the tenant's unique identifier using the subscription plan.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the subscription plan.
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the frequency of the subscription plan (e.g., monthly or yearly).
    /// </summary>
    public SubscriptionFrequenciesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the first name of the billing contact. Maximum length is 50 characters.
    /// </summary>
    [StringLength(50)]
    public string? FirstName { get; set; }

    /// <summary>
    /// Gets or sets the last name of the billing contact. Maximum length is 50 characters.
    /// </summary>
    [StringLength(50)]
    public string? LastName { get; set; }

    /// <summary>
    /// Gets or sets the first address line.
    /// </summary>
    public required string AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the second address line (optional).
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
    /// Gets or sets the state of the billing address.
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
    /// Gets or sets the GST number if applicable.
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
    /// Gets or sets a value indicating whether the subscription has recurring payments enabled.
    /// </summary>
    public bool IsRecurringPayment { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tenant wants to notify the customer.
    /// </summary>
    public bool IsNotifyCustomer { get; set; }
}
