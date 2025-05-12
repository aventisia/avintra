namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a single data field to extract from a document, including its name, type, and optional extraction instructions.
/// </summary>
public class FieldSetup : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the FieldSetup entity.
    /// </summary>
    [Key]
    public Guid Id { get; set; }
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// The name of the field to extract.
    /// </summary>
    [Required, MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// The data type of the field to extract (e.g., string, number, date).
    /// </summary>
    [Required, MaxLength(255)]
    public required string Type { get; set; }

    /// <summary>
    /// Optional instructions or context to guide how the field should be extracted.
    /// </summary>
    public string? Instructions { get; set; }

    /// <summary>
    /// Foreign key referencing the associated extraction setup.
    /// </summary>
    public Guid ExtractionSetupId { get; set; }

    /// <summary>
    /// Navigation property linking to the parent extraction setup.
    /// </summary>
    [ForeignKey("ExtractionSetupId")]
    public virtual ExtractionSetup? ExtractionSetup { get; set; }
}
