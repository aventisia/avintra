namespace WorkspaceAPIs.DTOs;

/// <summary>
/// DTO for the Search WorcTemplate entity.
/// </summary>
public class SearchProjectTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the WORC template.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated flow version.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the name of the worc template. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the worc template. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the structural category of the template (e.g., Block, Agent).
    /// </summary>
    public ProjectTemplateTypesEnum Type { get; set; }
}