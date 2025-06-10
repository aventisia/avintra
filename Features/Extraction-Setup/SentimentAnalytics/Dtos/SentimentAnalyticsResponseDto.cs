namespace MLModelBuilderAPIs.DTOs;

public class SentimentAnalyticsResponseDto
{
    /// <summary>
    /// Gets or sets the identifier for the model associated with the file extraction process.
    /// </summary>
    public Guid ModelId { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data for each file that has been processed.
    /// </summary>
    public required List<SentimentAnalyticsSetupFileData> FilesExtractedData { get; set; }
}

public class SentimentAnalyticsSetupFileData
{
    /// <summary>
    /// Gets or sets the identifier for the file from which data has been extracted.
    /// </summary>
    public Guid FileId { get; set; }

    /// <summary>
    /// Gets or sets remarks related to the extracted data. 
    /// Remarks may indicate issues such as incomplete or problematic data extraction.
    /// </summary>
    public required string Remarks { get; set; }

    /// <summary>
    /// Gets or sets the list of structured data segments extracted from the document.
    /// </summary>
    public required List<SentimentAnalyticsSetupData> ExtractedData { get; set; }
}

/// <summary>
/// Represents a single item of sentiment analytics data, including its name and associated value.
/// </summary>
public class SentimentAnalyticsSetupData
{
    /// <summary>
    /// Gets or sets the unique key associated with the sentiment category.
    /// </summary>
    public string? Index { get; set; }

    /// <summary>
    /// Gets or sets the name of the sentiment analytics data item.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the value associated with the sentiment analytics data item. 
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the confidence score of the extracted field.
    /// </summary>
    public string? ConfidenceScore { get; set; }
}