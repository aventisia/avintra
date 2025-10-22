namespace AccountsAPIs.DTOs;

public class BillingHistoryDetailsDto
{
    /// <summary>
    /// Gets or sets the ID of the billing history.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the billing history.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the date the billing ammount was paid.
    /// </summary>
    public DateTimeOffset? PaidOn { get; set; }

    /// <summary>
    /// Gets or sets the payment status for the billing history. Possible values: Created, Authorized, Captured, Refunded, Failed.
    /// </summary>
    public PaymentStatusTypesEnum PaymentStatus { get; set; }

    /// <summary>
    /// Gets or sets the subscription frequency (e.g., monthly or yearly).
    /// </summary>
    public SubscriptionFrequenciesEnum Frequency { get; set; }

    /// <summary>
    /// <summary>
    /// Gets or sets the base subscription amount, excluding tax.
    /// </summary>
    public decimal Amount { get; set; }

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
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}