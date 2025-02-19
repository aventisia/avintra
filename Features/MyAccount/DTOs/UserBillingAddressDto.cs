namespace AccountsAPIs.DTOs;

public class UserBillingAddressDto
{
    /// <summary>
    /// Gets or sets the is individual user or user of tenant
    /// </summary>
    public bool IsIndividual { get; set; }

    /// <summary>
    /// Gets or sets the type of the address like personal or tenant
    /// </summary>
    public AddressType? AddressType { get; set; }

    /// <summary>
    /// Gets or sets the tenants name Max-100
    /// </summary>
    [StringLength(100)]
    public string? TenantName { get; set; }

    /// <summary>
    /// Gets or sets the tenants user's role
    /// </summary>
    public string? Designation { get; set; }

    /// <summary>
    /// Gets or sets the address for the 
    /// </summary>
    [StringLength(300), Required]
    public string? AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the address for the 
    /// </summary>
    [StringLength(300)]
    public string? AddressLine2 { get; set; }

    /// <summary>
    /// Gets or sets the country of the user's tenants. Max-100.
    /// </summary>
    [StringLength(100), Required]
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the state or province of the user's tenants. Max-100.
    /// </summary>
    [StringLength(100), Required]
    public string? StateOrProvince { get; set; }

    /// <summary>
    /// Gets or sets the city of the user's tenants. Max-100.
    /// </summary>
    [StringLength(100), Required]
    public string? City { get; set; }

    /// <summary>
    /// Gets or sets the Zip or postal code of the user's tenants. Max-10.
    /// </summary>
    [StringLength(10), Required]
    public string? ZipOrPostalCode { get; set; }
}