namespace MLModelBuilderAPIs.DTOs;

public class DocumentDraftingConfigDto
{
    /// <summary>
    /// Gets or sets the title of the document to be drafted.
    /// </summary>
    public required string DocumentTitle { get; set; }

    /// <summary>
    /// Gets or sets the type of document to be created, such as report, article, or whitepaper.
    /// </summary>
    public required string DocumentType { get; set; }

    /// <summary>
    /// Gets or sets the set of guidelines or instructions that dictate how the document should be structured and drafted.
    /// </summary>
    public required string GuidelineInstruction { get; set; }

    /// <summary>
    /// Gets or sets the structure or format in which the document should be organized (e.g., section headers, paragraphs, bullet points).
    /// </summary>
    public required string OutputStructure { get; set; }

    /// <summary>
    /// Gets or sets whether localization is required for the document, specifying if the content needs to be adapted for different regions or languages.
    /// </summary>
    public required string LocalizationNeeded { get; set; }

    /// <summary>
    /// Gets or sets a list of reference documents that provide context or preferred content for drafting the document.
    /// </summary>
    public List<ReferenceDocumentDto>? PreferenceDocuments { get; set; }
}
