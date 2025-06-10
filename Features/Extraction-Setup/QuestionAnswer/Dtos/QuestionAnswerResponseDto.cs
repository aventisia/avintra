namespace MLModelBuilderAPIs.DTOs;

public class QuestionAnswerResponseDto
{
    /// <summary>
    /// Gets or sets the identifier for the model associated with the extraction process for the file.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each processed file.
    /// </summary>
    public required List<QuestionAnswerSetupFileData> FilesExtractedData { get; set; }
}

public class QuestionAnswerSetupFileData
{
    /// <summary>
    /// Gets or sets the identifier for the file from which data has been extracted.
    /// </summary>
    public Guid FileId { get; set; }

    /// <summary>
    /// Gets or sets remarks regarding the extracted data. 
    /// For example, remarks may indicate any issues encountered during extraction, such as incomplete or erroneous data.
    /// </summary>
    public required string Remarks { get; set; }

    /// <summary>
    /// Gets or sets the list of structured data segments that have been extracted from the document.
    /// </summary>
    public required List<QuestionAnswerSetupData> ExtractedData { get; set; }
}

/// <summary>
/// Represents a question and its corresponding answer extracted from a document.
/// </summary>
public class QuestionAnswerSetupData
{
    // <summary>
    /// Gets or sets the unique key associated with the sentiment category.
    /// </summary>
    public string? Index { get; set; }
    
    /// <summary>
    /// Gets or sets the text of the question.
    /// </summary>
    public required string Question { get; set; }

    /// <summary>
    /// Gets or sets the text of the answer. 
    /// </summary>
    public string? Answer { get; set; }

    /// <summary>
    /// Gets or sets the confidence score of the extracted field.
    /// </summary>
    public string? ConfidenceScore { get; set; }
}
