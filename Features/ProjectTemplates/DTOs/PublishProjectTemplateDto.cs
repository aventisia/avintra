namespace WorkspaceAPIs.DTOs;

public class PublishProjectTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the agent version being published.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the project template. Limited to 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a brief description of the project template.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type or structure of the template (e.g., Block, Agent).
    /// </summary>
    public ProjectTemplateTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the access level required to use or manage the template.
    /// </summary>
    public AccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the list of space identifiers where the agent template is applicable.
    /// </summary>
    public List<Guid>? SpaceIds { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the referenced flow or model version linked to this template.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets a collection of tags associated with the template for categorization or search.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the collection of uploaded files associated with the template.
    /// </summary>
    public List<IFormFile> Files { get; set; } = new List<IFormFile>();

    /// <summary>
    /// Gets or sets the collection of resource file metadata associated with the project template. Typically populated after file uploads.
    /// </summary>
    public IEnumerable<TemplateResourceFileDto> FileResources { get; set; } = new List<TemplateResourceFileDto>();
}