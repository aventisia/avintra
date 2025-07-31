namespace MLModelBuilderAPIs.DTOs;

public class RFPResponseGenerationConfigDto
{
    /// <summary>
    /// Gets or sets the name of the client (company) that the content will be focused on.
    /// </summary>
    public required string ClientName { get; set; }

    /// <summary>
    /// Gets or sets the website link of the client, typically the URL where more information can be found.
    /// </summary>
    public required string WebsiteLink { get; set; }

    /// <summary>
    /// Gets or sets a list of reference documents that provide context for the response generation process.
    /// </summary>
    public List<ReferenceDocumentDto>? RPFDocument { get; set; }

    /// <summary>
    /// Gets or sets the response strategy, detailing how the generated content should address the client's needs.
    /// </summary>
    public required string ResponseStrategy { get; set; }

    /// <summary>
    /// Gets or sets the response boundaries, including any limitations or scope for the content generation.
    /// </summary>
    public required string ResponseBoundary { get; set; }

    /// <summary>
    /// Gets or sets a list of external reference links that may be consulted for additional context or validation during content generation.
    /// </summary>
    public List<string>? Links { get; set; }

    /// <summary>
    /// Gets or sets a list of preferred documents that should be prioritized or emphasized during content generation.
    /// </summary>
    public List<ReferenceDocumentDto>? PreferDocument { get; set; }
}

public class ReferenceDocumentDto
{
    /// <summary>
    /// Gets or sets the unique identifier for a reference document, used to link it to content generation tasks.
    /// </summary>
    public required Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the path to the reference document, which indicates where it can be found or accessed.
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// Gets or sets the name or title of the reference document, offering context on its relevance to content generation.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets optional instructions on how the reference document should be utilized in the content generation process.
    /// </summary>
    public string? Instructions { get; set; }
}
