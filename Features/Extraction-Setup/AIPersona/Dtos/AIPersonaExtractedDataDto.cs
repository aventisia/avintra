namespace MLModelBuilderAPIs.DTOs;

public class AIPersonaExtractedDataDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the AI persona data record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the machine learning model associated with this AI persona record.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the document ID associated with this AI persona data.
    /// </summary>
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the name of the document tied to this AI persona data entry.
    /// </summary>
    [StringLength(255)]
    public string? DocName { get; set; }

    /// <summary>
    /// Gets or sets the structured data segments that were extracted from the document for the AI persona.
    /// </summary>
    public AIPersonaSetupData? ExtractedData { get; set; }

    /// <summary>
    /// Gets or sets the accuracy score for this AI persona data entry.
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the type/category of the extracted data for the AI persona.
    /// </summary>
    public ExtractedDataType? Type { get; set; }

    /// <summary>
    /// Indicates whether the AI persona data or model has been submitted for further fine-tuning.
    /// </summary>
    public bool SubmitForFineTuning { get; set; }

    /// <summary>
    /// Gets or sets the token count related to this data record.
    /// </summary>
    public int TokenCount { get; set; }

    /// <summary>
    /// Gets or sets the number of times this data record has been executed.
    /// </summary>
    public int ExecutionCount { get; set; }

    /// <summary>
    /// Gets or sets the number of failed executions for this data record.
    /// </summary>
    public int FailedCount { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the AI persona data was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who originally created this AI persona data record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who last modified the AI persona data record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created this AI persona data record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the individual who created this AI persona data record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}