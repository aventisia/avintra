namespace MLModelBuilderAPIs.DTOs;

public class ClassificationResponseDto
{
    /// <summary>
    /// Gets or sets the identifier for the model associated with the file extraction process.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each processed file.
    /// </summary>
    public required List<ClassificationSetupFileData> FilesExtractedData { get; set; }
}

public class ClassificationSetupFileData
{
    /// <summary>
    /// Gets or sets the identifier for the file from which data has been extracted.
    /// </summary>
    public Guid FileId { get; set; }

    /// <summary>
    /// Gets or sets remarks regarding the extracted data. 
    /// For instance, remarks may indicate if the extraction process was incomplete or failed, providing details on the issue.
    /// </summary>
    public required string Remarks { get; set; }

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
    /// Gets or sets the execution time in seconds.
    /// </summary>
    public int ExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the list of structured data segments extracted from the file.
    /// </summary>
    public required List<ClassificationSetupData> ExtractedData { get; set; }
}

/// <summary>
/// Represents the data setup used in the classification process.
/// </summary>
public class ClassificationSetupData
{
    /// <summary>
    /// Gets or sets the unique key associated with the sentiment category.
    /// </summary>
    public string? Index { get; set; }

    /// <summary>
    /// Gets or sets the name associated with the classification setup data.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value corresponding to the classification setup data. 
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the confidence score of the extracted field.
    /// </summary>
    public string? ConfidenceScore { get; set; }
}
