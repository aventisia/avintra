namespace MLModelBuilderAPIs.DTOs;

public class ExtractionResponseDto
{
    /// <summary>
    /// Gets or sets the identifier for the model associated with the file extraction process.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each processed file.
    /// </summary>
    public required List<ExtractionSetupFileData> FilesExtractedData { get; set; }
}

public class ExtractionSetupFileData
{
    /// <summary>
    /// Gets or sets the identifier for the file from which data has been extracted.
    /// </summary>
    public Guid FileId { get; set; }

    /// <summary>
    /// Gets or sets remarks related to the extracted data. 
    /// Remarks can indicate if the extraction process encountered issues, such as incomplete or inaccurate data.
    /// </summary>
    public required string Remarks { get; set; }

    /// <summary>
    /// Gets or sets the structured data segments extracted from the file.
    /// </summary>
    public required ExtractionSetupData ExtractedData { get; set; }
}

/// <summary>
/// Represents the structured data extracted from a document, including fields and tables.
/// </summary>
public class ExtractionSetupData
{
    /// <summary>
    /// Gets or sets the list of fields extracted from this section of the document.
    /// </summary>
    public List<ExtractionSetupFieldValueSchema>? Fields { get; set; }

    /// <summary>
    /// Gets or sets the list of tables extracted from this section of the document.
    /// </summary>
    public List<ExtractionSetupTableSchema>? Tables { get; set; }
}

/// <summary>
/// Represents a single field extracted from the document, including its name and an optional value.
/// </summary>
public class ExtractionSetupFieldValueSchema
{

    /// <summary>
    /// Gets or sets the unique key associated with the filed value schema.
    /// </summary>
    public string? Index { get; set; }

    /// <summary>
    /// Gets or sets the name of the extracted field.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value of the extracted field.
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the confidence score of the extracted field.
    /// </summary>
    public string? ConfidenceScore { get; set; }
}

/// <summary>
/// Represents a table extracted from the document, containing its name and a collection of headers with values.
/// </summary>
public class ExtractionSetupTableSchema
{
    /// <summary>
    /// Gets or sets the unique key associated with the table schema.
    /// </summary>
    public string? Index { get; set; }

    /// <summary>
    /// Gets or sets the name identifying the extracted table.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the list of headers associated with the table, along with their corresponding row values.
    /// </summary>
    public List<ExtractionSetupTableHeaderSchema>? Headers { get; set; }
}

/// <summary>
/// Represents a header in an extracted table, along with its associated values under the header.
/// </summary>
public class ExtractionSetupTableHeaderSchema
{
    /// <summary>
    /// Gets or sets the unique key associated with the table header schema.
    /// </summary>
    public string? Index { get; set; }

    /// <summary>
    /// Gets or sets the name of the table column header.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the list of values under this header in the table.
    /// </summary>
    public List<string>? Values { get; set; }
}