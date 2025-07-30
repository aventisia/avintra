namespace WorkspaceAPIs.DTOs;

public class WorcTemplateCategoryBySearchQueryDto
{
    /// <summary>
    /// Gets or sets the structural category of the template (e.g., Block, Agent).
    /// </summary>
    public required PublishTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the name of the worc template. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public string? Name { get; set; }
}
