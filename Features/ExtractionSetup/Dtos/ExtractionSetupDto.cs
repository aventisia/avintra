namespace MLModelBuilderAPIs.DTOs;

public class ExtractionSetupDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the extraction setup within the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Optional description of the document's context or type, providing additional information to guide the extraction process.
    /// </summary>
    public string? DocumentContext { get; set; }

    /// <summary>
    /// The prompt that is required to guide the node for data extraction, with a maximum length of 1000 characters.
    /// </summary>
    [StringLength(1000)]
    public required string NodePrompt { get; set; }

    /// <summary>
    /// Metadata about tables used in the extraction setup, if available.
    /// </summary>
    public IEnumerable<TableMetadataDto>? TableMetadata { get; set; }

    /// <summary>
    /// Setup configurations for fields to be extracted, if available.
    /// </summary>
    public IEnumerable<FiledSetupDto>? FiledSetups { get; set; }

    /// <summary>
    /// The unique identifier of the machine learning model associated with this extraction setup.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the extraction setup was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the extraction setup record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who last modified the extraction setup record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created the extraction setup record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the extraction setup record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}


public class FiledSetupDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the field setup within the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The name of the field to extract within the document.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// The data type of the field to extract (e.g., string, number, date).
    /// </summary>
    [StringLength(255)]
    public required string Type { get; set; }

    /// <summary>
    /// Optional instructions or context to guide how the field should be extracted.
    /// </summary>
    public string? Instructions { get; set; }
}

public class TableMetadataDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the table metadata within the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Optional context or description of the table, such as its purpose or location within the document.
    /// </summary>
    public string? Context { get; set; }

    /// <summary>
    /// The name of the table as used in the extraction process.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// List of headers associated with the table.
    /// </summary>
    public IEnumerable<TableHeaderDto>? TableHeaders { get; set; }
}

public class TableHeaderDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the table header within the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The name of the column in the table to be extracted.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// The data type of the column (e.g., string, number, date).
    /// </summary>
    [StringLength(255)]
    public required string Type { get; set; }

    /// <summary>
    /// Optional instructions or context to guide the extraction process for this column.
    /// </summary>
    public string? Instructions { get; set; }
}