namespace AccountsAPIs.DTOs;

public class BillingHistoryDto
{
    /// <summary>
    /// Gets or sets the ID of the Billing Account.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the subscription frequency (e.g., monthly or yearly).
    /// </summary>
    public SubscriptionFrequenciesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the base subscription amount, excluding tax.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the tax rate as a percentage (e.g., 18 for 18%).
    /// </summary>
    public decimal TaxRate { get; set; } = 18;

    /// <summary>
    /// Gets or sets the link to the generated invoice for this billing.
    /// </summary>
    public string? InvoiceLink { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user account is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the person who created the user record. 
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the individual who last modified the record.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}