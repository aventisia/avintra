namespace MLModelBuilderAPIs.DTOs;

public class ExtractionResponseDto
{
    /// <summary>
    /// Gets or sets the model id for which the file is being extracted.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each file.
    /// </summary>
    public required List<ExtractionSetupFileData> FilesExtractedData { get; set; }
}

public class ExtractionSetupFileData
{
    /// <summary>
    /// Gets or sets the file id for which the data has been extracted.
    /// </summary>
    public Guid FileId { get; set; }

    /// <summary>
    /// Gets or sets the remarks for the extracted data. For example, if the data is not extracted properly, the remarks can be used to provide the reason.
    /// </summary>
    public required string Remarks { get; set; }

    /// <summary>
    /// Gets or sets the list of structured data segments extracted from the document.
    /// </summary>
    public required ExtractionSetupData ExtractedData { get; set; }
}

/// <summary>
/// Represents a structured data section extracted from a document, which may include fields and tables.
/// </summary>
public class ExtractionSetupData
{
    /// <summary>
    /// Gets or sets the list of extracted fields in this section.
    /// </summary>
    public List<ExtractionSetupFieldValueSchema>? Fields { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted tables in this section.
    /// </summary>
    public List<ExtractionSetupTableSchema>? Tables { get; set; }
}

/// <summary>
/// Represents a single field extracted from the document, containing a name and an optional value.
/// </summary>
public class ExtractionSetupFieldValueSchema
{
    /// <summary>
    /// Gets or sets the name of the extracted field.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value of the extracted field, if available.
    /// </summary>
    public string? Value { get; set; }
}

/// <summary>
/// Represents a table extracted from the document, containing a name and a collection of headers with values.
/// </summary>
public class ExtractionSetupTableSchema
{
    /// <summary>
    /// Gets or sets the name identifying the extracted table.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the list of headers with their corresponding row values.
    /// </summary>
    public List<ExtractionSetupTableHeaderSchema>? Headers { get; set; }
}

/// <summary>
/// Represents a header in an extracted table and the associated values under that header.
/// </summary>
public class ExtractionSetupTableHeaderSchema
{
    /// <summary>
    /// Gets or sets the name of the table column header.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the list of values under this header column.
    /// </summary>
    public List<string>? Values { get; set; }
}
