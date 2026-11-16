namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the information needed to manage a tenant organization.
/// This DTO is used for both creating and updating tenant details.
/// </summary>
public class TenantOrganizationDto
{
    /// <summary>
    /// Gets or sets the type of the tenant.
    /// </summary>
    public TenantTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the name of the organization. Maximum length is 100 characters.
    /// </summary>
    [StringLength(100)]
    public required string OrganizationName { get; set; }

    /// <summary>
    /// Gets or sets the domain associated with the organization's email. Maximum length is 100 characters.
    /// </summary>
    [StringLength(100)]
    public required string Domain { get; set; }

    /// <summary>
    /// Gets or sets the total number of employees in the organization.
    /// </summary>
    public int NumberOfEmployees { get; set; }

    /// <summary>
    /// Gets or sets the industry in which the organization operates.
    /// </summary>
    public string? Industry { get; set; }

    /// <summary>
    /// Gets or sets the country where the organization is based.
    /// </summary>
    public CountriesEnum Country { get; set; }

    /// <summary>
    /// Gets or sets the role of the user within the organization (e.g., Administrator, Manager, Employee).
    /// </summary>
    public string? Role { get; set; }
}
