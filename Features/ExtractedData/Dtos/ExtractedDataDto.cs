namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents an extracted data entity 
/// </summary>
public class ExtractedDataDto 
{
    /// <summary>
    /// Gets or sets the primary key for the data model
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the library identifier to which the data model record is associated
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the extracted fields JSON data in string format. The default value will be an empty object.
    /// </summary>
    public string? DataObject { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who modified the record last.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }

}