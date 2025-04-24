namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the address details associated with an account.
/// </summary>
public class AddressDto
{
    /// <summary>
    /// Unique identifier of the account.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Reference ID related to the address, such as a tenant or user ID.
    /// </summary>
    public Guid? AddressRefId { get; set; }

    /// <summary>
    /// Specifies the type of the address (e.g., tenant or personal).
    /// </summary>
    public AddressTypeEnum? AddressType { get; set; }

    /// <summary>
    /// First line of the address. Maximum length is 100 characters.
    /// </summary>
    [StringLength(100)]
    public string? AddressLine1 { get; set; }

    /// <summary>
    /// Second line of the address. Maximum length is 100 characters.
    /// </summary>
    [StringLength(100)]
    public string? AddressLine2 { get; set; }

    /// <summary>
    /// Country associated with the  address. Maximum length is 100 characters.
    /// </summary>
    [StringLength(100)]
    public string? Country { get; set; }

    /// <summary>
    /// State or province associated with the address. Maximum length is 100 characters.
    /// </summary>
    [StringLength(100)]
    public string? StateOrProvince { get; set; }

    /// <summary>
    /// City associated with the address. Maximum length is 100 characters.
    /// </summary>
    [StringLength(100)]
    public string? City { get; set; }

    /// <summary>
    /// ZIP or postal code. Maximum length is 10 characters.
    /// </summary>
    [StringLength(10)]
    public string? ZipOrPostalCode { get; set; }

    /// <summary>
    /// Name or identifier of the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Username of the individual who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Timestamp indicating when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Unique identifier of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }
}
