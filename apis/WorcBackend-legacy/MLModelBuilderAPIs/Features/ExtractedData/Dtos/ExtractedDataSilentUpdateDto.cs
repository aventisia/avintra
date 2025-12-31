/// <summary>
/// Represents the data transfer object (DTO) used for silently updating an extracted data record.
/// </summary>
public class ExtractedDataSilentUpdateDataDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the data record.
    /// </summary>
    public required Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the machine learning model associated with this data record.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the document associated with this data record.
    /// </summary>
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the extracted fields in JSON format.
    /// </summary>
    public required string DataObject { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the data has been submitted for fine-tuning.
    /// </summary>
    public bool SubmitForFineTuning { get; set; }
}
