namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) for a tenant's billing and organizational information.
/// </summary>
public class TenantOrganizationBillingDto
{
    /// <summary>
    /// Gets or sets the unique identifier (ID) of the tenant record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the organization.
    /// </summary>
    [StringLength(200)]
    public required string OrganizationName { get; set; }

    /// <summary>
    /// Gets or sets the first line of the billing address.
    /// </summary>
    public required string AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the optional second line of the billing address.
    /// </summary>
    public string? AddressLine2 { get; set; }

    /// <summary>
    /// Gets or sets the city associated with the billing address.
    /// </summary>
    public required string City { get; set; }

    /// <summary>
    /// Gets or sets the postal code for the billing address.
    /// </summary>
    public required string PostalCode { get; set; }

    /// <summary>
    /// Gets or sets the state or province of the billing address.
    /// </summary>
    public required string State { get; set; }

    /// <summary>
    /// Gets or sets the country for the billing address.
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
}