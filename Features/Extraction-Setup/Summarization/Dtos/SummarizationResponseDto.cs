namespace MLModelBuilderAPIs.DTOs;

public class SummarizationResponseDto
{
    /// <summary>
    /// Gets or sets the identifier for the model from which the file data is being extracted.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each file processed.
    /// </summary>
    public required List<SummarizationSetupFileData> FilesExtractedData { get; set; }
}

public class SummarizationSetupFileData
{
    /// <summary>
    /// Gets or sets the identifier for the file from which data has been extracted.
    /// </summary>
    public Guid FileId { get; set; }

    /// <summary>
    /// Gets or sets the remarks related to the extracted data. 
    /// For example, remarks can indicate if the data extraction was incomplete or problematic.
    /// </summary>
    public required string Remarks { get; set; }

    /// <summary>
    /// Gets or sets the structured data segments extracted from the document.
    /// </summary>
    public required SummarizationSetupData ExtractedData { get; set; }
}

/// <summary>
/// Represents the extracted data for the summarization setup, including the final summary content.
/// </summary>
public class SummarizationSetupData
{
    /// <summary>
    /// Gets or sets the summarized text after processing.
    /// </summary>
    public string? Summary { get; set; }
}
