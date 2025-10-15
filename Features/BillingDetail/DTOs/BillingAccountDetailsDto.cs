namespace AccountsAPIs.DTOs;

public class BillingAccountDetailsDto
{
    /// <summary>
    /// Gets or sets the ID of the Billing Account.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the Billing Account.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the date the billing ammount was paid.
    /// </summary>
    public DateTimeOffset? PaidOn { get; set; }

    /// <summary>
    /// Gets or sets the payment status of the account billing.
    /// </summary>
    public PaymentStatusEnum PaymentStatus { get; set; } = PaymentStatusEnum.Pending;

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
    /// Gets or sets the unique identifier of the subscription associated with this billing.
    /// </summary>
    public Guid SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the assigned subscription plan.
    /// </summary>
    public string? PlanName { get; set; }

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