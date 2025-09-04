namespace WorkspaceAPIs.DTOs;

/// <summary>
/// DTO for the SearchProjectTemplate entity.
/// </summary>
public class SearchProjectTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the project template.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the referenced flow or model version linked to this template.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the name of the project template. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the project template. Max-500 characters.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the structural category of the template (e.g., Block, Agent).
    /// </summary>
    public ProjectTemplateTypesEnum Type { get; set; }
}