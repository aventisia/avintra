namespace AccountsAPIs.DTOs;

public class BillingAccountDto
{
    /// <summary>
    /// Gets or sets the ID of the Billing Account.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the address for the billing account
    /// </summary>
    public string Address { get; set; }

    /// <summary>
    /// Gets or sets the email for the billing account
    /// </summary>
    public string BillingEmail { get; set; }

    /// <summary>
    /// Gets or sets the phone number for the billing account
    /// </summary>
    public string PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the contact person for the billing account
    /// </summary>
    public string ContactPerson { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the Id of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }
}