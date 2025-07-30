namespace WorkspaceAPIs.DTOs;

public class PublishTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the agent version being published.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the agent template.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the agent template.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the functional purpose of the template (e.g., Workflow, Automation).
    /// </summary>
    public FlowTypesEnum Purpose { get; set; }

    /// <summary>
    /// Gets or sets the structural category of the template (e.g., Block, Agent).
    /// </summary>
    public PublishTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the access level for the agent template. Possible values include: Space, Tenant Level, and Public.
    /// </summary>
    public required AccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the list of space identifiers where the agent template is applicable.
    /// </summary>
    public List<Guid>? SpaceIds { get; set; }

    /// <summary>
    /// Gets or sets the reference ID for the underlying agent configuration or logic.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets a list of tags associated with the agent template.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();
}
