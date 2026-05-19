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
    /// Gets or sets instructions or guidelines on how to use or clone this template.
    /// </summary>
    public string? Instruction { get; set; }

    /// <summary>
    /// Gets or sets the type or structure of the template (e.g., Block, Agent).
    /// </summary>
    public ProjectTemplateTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the access level required to use or manage the template.
    /// </summary>
    public TemplateAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the list of space identifiers where the agent template is applicable.
    /// </summary>
    public List<Guid>? SpaceIds { get; set; }

    /// <summary>
    /// Gets or sets the JSON schema that defines the template's structure and rules.
    /// </summary>
    public string? Schema { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the referenced flow or model version linked to this template.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets a collection of tags associated with the template for categorization or search.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets a collection of icons or avatars that visually represent the template.
    /// </summary>
    public List<string>? Icons { get; set; }

    /// <summary>
    /// Gets or sets the collection of resource files associated with the project template.
    /// </summary>
    public IEnumerable<TemplateResourceDto>? Resources { get; set; }
}