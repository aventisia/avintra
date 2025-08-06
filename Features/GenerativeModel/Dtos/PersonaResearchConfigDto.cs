namespace MLModelBuilderAPIs.DTOs;

public class PersonaResearchConfigDto
{
    /// <summary>
    /// Gets or sets the name of the persona being researched or focused on for content generation.
    /// </summary>
    public required string PersonaName { get; set; }

    /// <summary>
    /// Gets or sets the name of the company associated with the persona or the company related to the content.
    /// </summary>
    public required string CompanyName { get; set; }

    /// <summary>
    /// Gets or sets a list of external reference links that may be used for additional research or validation during content generation.
    /// </summary>
    public List<ReferenceLinkDto>? Links { get; set; }

    /// <summary>
    /// Gets or sets the purpose or objective of the research, such as understanding customer behaviors or creating a persona profile.
    /// </summary>
    public required string PurposeOfResearch { get; set; }

    /// <summary>
    /// Gets or sets the desired depth or length of the generated content (e.g., concise, medium, detailed).
    /// </summary>
    public required string DesiredOutput { get; set; }
}
