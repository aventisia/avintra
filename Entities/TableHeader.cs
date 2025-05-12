namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a single column (header) within a table to be extracted from a document,
/// including its name, data type, and optional extraction instructions.
/// </summary>
public class TableHeader : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the TableHeader entity.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// The name of the column to extract from the table.
    /// </summary>
    [Required, MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// The data type of the column (e.g., string, number, date).
    /// </summary>
    [Required, MaxLength(255)]
    public required string Type { get; set; }

    /// <summary>
    /// Optional instructions to guide the extraction process for this column.
    /// </summary>
    public string? Instructions { get; set; }

    /// <summary>
    /// Foreign key referencing the parent table metadata entry.
    /// </summary>
    public Guid TableMetadataId { get; set; }

    /// <summary>
    /// Navigation property linking to the associated table metadata.
    /// </summary>
    [ForeignKey("TableMetadataId")]
    public virtual TableMetadata? TableMetadata { get; set; }
}
