namespace AccountsAPIs.Entities;

public class Address : BaseEntity
{
    /// <summary>
    /// Gets or sets the referance for the record like tenant Id or
    /// userid for personal address 
    /// </summary>
    public Guid? AddressRefId { get; set; }

    /// <summary>
    /// Gets or sets the referance for the record like tenant Id or
    /// userid for personal address 
    /// </summary>
    public AddressType? AddressType { get; set; }

    /// <summary>
    /// Gets or sets the address of the user. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the address of the user. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? AddressLine2 { get; set; }

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