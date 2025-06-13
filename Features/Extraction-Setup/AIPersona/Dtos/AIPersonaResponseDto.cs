namespace MLModelBuilderAPIs.DTOs;

public class AIPersonaResponseDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the AI persona model from which the file data is being extracted.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each file processed as part of the AI persona setup.
    /// </summary>
    public required List<AIPersonaSetupFileData> FilesExtractedData { get; set; }
}

public class AIPersonaSetupFileData
{
    /// <summary>
    /// Gets or sets the remarks related to the extracted data. 
    /// Remarks can indicate if the data extraction was incomplete or encountered issues.
    /// </summary>
    public required string Remarks { get; set; }


    /// <summary>
    /// Gets or sets the token count related to this data record.
    /// </summary>
    public required int TokenCount { get; set; }

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
    /// Gets or sets the structured data segments extracted from the file for the AI persona model.
    /// </summary>
    public required AIPersonaSetupData ExtractedData { get; set; }
}

/// <summary>
/// Represents the extracted data for setting up the AI persona model, including structured data.
/// </summary>
public class AIPersonaSetupData
{
    /// <summary>
    /// Gets or sets the structured data relevant to the AI persona model.
    /// </summary>
    public string? Data { get; set; }
}
