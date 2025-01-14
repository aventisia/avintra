namespace WorkspaceAPIs.DTOs;

public class FlowTemplateCategoryBySearchQueryDto
{
    /// <summary>
    /// Gets or sets the category of the flow template (e.g., Workflow, Automation, etc.).
    /// </summary>
    
    public required CategoryTypesEnum Type { get; set; }
    /// <summary>
    /// Gets or sets the name of the flow template. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public string? Name { get; set; }


}