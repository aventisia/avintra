namespace MLModelBuilderAPIs.DTOs;

public class ExtractResponseDto
{
    /// <summary>
    /// Gets or sets the model id for which the file is being extracted.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each file.
    /// </summary>
    public required List<FileExtractedData> FilesExtractedData { get; set; }
}

public class FileExtractedData
{
    /// <summary>
    /// Gets or sets the file id for which the data has been extracted.
    /// </summary>
    public Guid FileId { get; set; }

    /// <summary>
    /// Gets or sets the stringfied extracted json data. Response of our LLM model.
    /// </summary>
    public required List<FieldValueSchema> ExtractedData { get; set; }

    /// <summary>
    /// Gets or sets the remarks for the extracted data. For example, if the data is not extracted properly, the remarks can be used to provide the reason.
    /// </summary>
    public required string Remarks { get; set; }
}

public class FieldValueSchema
{
    /// <summary>
    /// Gets or sets the field name.
    /// </summary>
    public required string FieldName { get; set; }

    /// <summary>
    /// Gets or sets the field value.
    /// </summary>
    public required string FieldValue { get; set; }
}