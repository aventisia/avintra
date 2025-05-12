/// <summary>
/// Represents metadata for a structured table identified within a document, 
/// including its name, context, and associated headers for data extraction.
/// </summary>
public class TableMetadata : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the TableMetadata entity.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Optional context or description of the table, such as its purpose or location within the document.
    /// </summary>
    public string? Context { get; set; }

    /// <summary>
    /// The name of the table as used in the extraction process.
    /// </summary>
    [Required, MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Foreign key referencing the associated extraction setup.
    /// </summary>
    public Guid ExtractionSetupId { get; set; }

    /// <summary>
    /// Navigation property linking this table metadata to its parent extraction setup.
    /// </summary>
    [ForeignKey("ExtractionSetupId")]
    public virtual ExtractionSetup? ExtractionSetup { get; set; }

    /// <summary>
    /// A collection of headers representing individual columns or fields within the table.
    /// </summary>
    public virtual ICollection<TableHeader>? TableHeaders { get; set; }
}