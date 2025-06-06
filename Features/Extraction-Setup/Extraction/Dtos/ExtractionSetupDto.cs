namespace MLModelBuilderAPIs.DTOs;

public class MLModelSetupDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the extraction setup within the ML model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the data model's fields JSON data in string format. The default value will be an empty object.
    /// </summary>
    public ExtractionSetupDto? SetupObject { get; set; }

    /// <summary>
    /// Gets or sets the date of creation of ML model.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

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

public class ExtractionSetupDto
{
    /// <summary>
    /// Optional description of the document's context or type, providing additional information to guide the extraction process.
    /// </summary>
    [Required]
    public required string Context { get; set; }

    /// <summary>
    /// The prompt that is required to guide the node for data extraction, with a maximum length of 1000 characters.
    /// </summary>
    [Required]
    public required string Prompt { get; set; }

    /// <summary>
    /// Metadata about tables used in the extraction setup, if available.
    /// </summary>
    public List<TableMetadataDto>? TableMetadata { get; set; }

    /// <summary>
    /// Setup configurations for fields to be extracted, if available.
    /// </summary>
    public List<FieldSetupDto>? FieldSetups { get; set; }

    /// <summary>
    /// Specifies the type or identifier of the large language model (LLM) being used.
    /// </summary>
    public string? LLM { get; set; }
}


public class FieldSetupDto
{
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
    public List<TableHeaderDto>? TableHeaders { get; set; }
}

public class TableHeaderDto
{
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