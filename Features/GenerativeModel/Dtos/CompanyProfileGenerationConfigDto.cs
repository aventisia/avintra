namespace MLModelBuilderAPIs.DTOs;

public class CompanyProfileGenerationConfigDto
{
    /// <summary>
    /// Gets or sets the name of the company that the content will be focused on.
    /// </summary>
    public required string CompanyName { get; set; }

    /// <summary>
    /// Gets or sets the website link of the company, typically the URL where more information can be found.
    /// </summary>
    public required string WebsiteLink { get; set; }

    /// <summary>
    /// Gets or sets the focus area or industry related to the company, such as technology, healthcare, or finance.
    /// </summary>
    public required string FocusArea { get; set; }

    /// <summary>
    /// Gets or sets the web data or information extracted from the company’s website or related sources.
    /// </summary>
    public required string WebData { get; set; }

    /// <summary>
    /// Gets or sets a list of external links that can be used for additional reference or validation during content generation.
    /// </summary>
    public List<string>? Links { get; set; }

    /// <summary>
    /// Gets or sets a list of document references, including any relevant instructions for the model to consider during content generation.
    /// </summary>
    public List<ReferenceDocumentDto>? Documents { get; set; }

    /// <summary>
    /// Gets or sets the desired depth or length of the summary content to be generated (e.g., short, medium, or detailed).
    /// </summary>
    public required string SummaryDepth { get; set; }
}