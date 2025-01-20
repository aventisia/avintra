
namespace AccountsAPIs.Entities;

public class BillingAccount : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the address for the billing account
    /// </summary>
    public required string Address { get; set; }

    /// <summary>
    /// Gets or sets the email for the billing account
    /// </summary>
    public required string BillingEmail { get; set; }

    /// <summary>
    /// Gets or sets the phone number for the billing account
    /// </summary>
    public required string PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the contact person for the billing account
    /// </summary>
    public string? ContactPerson { get; set; }

}