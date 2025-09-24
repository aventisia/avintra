namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) that contains the tenant's organizational information,
/// including identification, contact details, and billing address with associated GST information.
/// </summary>
public class TenantOrganizationBillingDto
{
    /// <summary>
    /// Gets or sets the unique identifier (ID) of the tenant record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the organization associated with the tenant.
    /// </summary>
    [StringLength(200)]
    public required string OrganizationName { get; set; }

    /// <summary>
    /// Gets or sets the email address for billing communications with the tenant.
    /// </summary>
    public string? BillingEmail { get; set; }

    /// <summary>
    /// Gets or sets the contact person phone number for the tenant.
    /// </summary>
    public string? ContactPerson { get; set; }

    /// <summary>
    /// Gets or sets the first line of the tenant's billing address (e.g., street address).
    /// </summary>
    public required string AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the optional second line of the tenant's billing address (e.g., apartment or suite number).
    /// </summary>
    public string? AddressLine2 { get; set; }

    /// <summary>
    /// Gets or sets the city of the tenant's billing address.
    /// </summary>
    public required string City { get; set; }

    /// <summary>
    /// Gets or sets the postal code for the tenant's billing address.
    /// </summary>
    public required string PostalCode { get; set; }

    /// <summary>
    /// Gets or sets the state or province of the tenant's billing address.
    /// </summary>
    public required string State { get; set; }

    /// <summary>
    /// Gets or sets the country of the tenant's billing address.
    /// </summary>
    public required CountriesEnum Country { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tenant is willing to file Goods and Services Tax (GST).
    /// </summary>
    public bool IsWillingToFileGst { get; set; }

    /// <summary>
    /// Gets or sets the GST number for the tenant, if applicable. This is only relevant if the tenant is willing to file GST.
    /// </summary>
    public string? GstNumber { get; set; }
}