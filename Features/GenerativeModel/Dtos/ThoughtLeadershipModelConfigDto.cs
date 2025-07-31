namespace MLModelBuilderAPIs.DTOs;

public class ThoughtLeadershipModelConfigDto
{
    /// <summary>
    /// Gets or sets the type of content to be generated, such as an article, report, or whitepaper.
    /// </summary>
    public required string DocumentType { get; set; }

    /// <summary>
    /// Gets or sets the central topic or theme that the content will focus on.
    /// </summary>
    public required string Topic { get; set; }

    /// <summary>
    /// Gets or sets the industry or domain the content is intended for, such as technology, healthcare, or finance.
    /// </summary>
    public required string Industry { get; set; }

    /// <summary>
    /// Gets or sets the purpose of the content, such as to inform, persuade, or educate the audience.
    /// </summary>
    public required string Purpose { get; set; }

    /// <summary>
    /// Gets or sets the tone, voice, and writing style that the model should use for the generated content.
    /// </summary>
    public required string ToneStyle { get; set; }

    /// <summary>
    /// Gets or sets the intended audience to help the model tailor content appropriately.
    /// </summary>
    public required string AudienceTarget { get; set; }

    /// <summary>
    /// Gets or sets the contextual data, statistics, or insights that will inform the generated output.
    /// </summary>
    public required string DataAndStats { get; set; }

    /// <summary>
    /// Gets or sets a list of external reference links that the model may use during content generation.
    /// </summary>
    public List<string>? Links { get; set; }

    /// <summary>
    /// Gets or sets a list of reference documents and associated usage instructions that support generation tasks.
    /// </summary>
    public List<ReferenceDocumentDto>? Documents { get; set; }

    /// <summary>
    /// Gets or sets the desired length or extent of the generated content.
    /// </summary>
    public required string ContentLength { get; set; }

    /// <summary>
    /// Gets or sets the structural format or layout the model should follow when generating content.
    /// </summary>
    public required string ContentStructure { get; set; }
}