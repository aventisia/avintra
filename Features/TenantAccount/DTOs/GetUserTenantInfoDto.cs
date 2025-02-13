namespace AccountsAPIs.DTOs;

public class GetUserTenantInfoDto
{
    /// <summary>
    /// Gets or sets the is individual user or user of tenant
    /// </summary>
    public required bool IsIndividual { get; set; }

    /// <summary>
    /// Gets or sets the tenants name Max-100
    /// </summary>
    [StringLength(100)]
    public required string TenantName { get; set; }

    /// <summary>
    /// Gets or sets the tenants user's role
    /// </summary>
    public virtual ICollection<AccountUserRole>? UserRoles { get; set; }

    /// <summary>
    /// Gets or sets the address for the 
    /// </summary>
    [StringLength(300)]
    public string? Address { get; set; }

    /// <summary>
    /// Gets or sets the country of the user's tenants. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the state or province of the user's tenants. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? StateOrProvince { get; set; }

    /// <summary>
    /// Gets or sets the city of the user's tenants. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? City { get; set; }

    /// <summary>
    /// Gets or sets the Zip or postal code of the user's tenants. Max-10.
    /// </summary>
    [StringLength(10)]
    public string? ZipOrPostalCode { get; set; }
}