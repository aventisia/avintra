
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

    /// <summary>
    /// Gets or sets the country of the user's company. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the state or province of the user's company. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? StateOrProvince { get; set; }

    /// <summary>
    /// Gets or sets the city of the user's company. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? City { get; set; }

    /// <summary>
    /// Gets or sets the Zip or postal code of the user's company. Max-10.
    /// </summary>
    [StringLength(10)]
    public string? ZipOrPostalCode { get; set; }

}