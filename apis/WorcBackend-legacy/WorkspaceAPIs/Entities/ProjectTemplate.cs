namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a project template used within the workspace environment.
/// </summary>
[Table("agent_FlowTemplates")]
public class ProjectTemplate : BaseEntity
{
    /// <summary>
    /// Gets or sets the unique identifier of the tenant that owns this template.
    /// </summary>
    public Guid? TenantId { get; set; }

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
    /// Gets or sets the current approval status of the project template, such as Approved, Rejected, or Pending Approval.
    /// </summary>
    public ProjectTemplateStatusesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets optional remarks providing context about the status, such as reasons for rejection or reviewer comments.
    /// </summary>
    public string? Remark { get; set; }

    /// <summary>
    /// Gets or sets the URL or path used to access or view this template.
    /// </summary>
    public required string AccessPath { get; set; }

    /// <summary>
    /// Gets or sets the type or structure of the template (e.g., Block, Agent).
    /// </summary>
    public ProjectTemplateTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the referenced flow or model version linked to this template.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the version number of the associated schema.
    /// </summary>
    public int SchemaVersion { get; set; }

    /// <summary>
    /// Gets or sets the JSON schema that defines the template's structure and rules.
    /// </summary>
    public string? Schema { get; set; }

    /// <summary>
    /// Gets or sets the number of times this template has been used to create models or flows.
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// Gets or sets the access level required to use or manage the template.
    /// </summary>
    public TemplateAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the space where the agent template is applicable.
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets a collection of icons or avatars that visually represent the template.
    /// </summary>
    public List<string>? Icons { get; set; }

    /// <summary>
    /// Gets or sets a collection of tags associated with the template for categorization or search.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the collection of resources associated with this project template.
    /// </summary>
    public virtual ICollection<TemplateResource>? TemplateResources { get; set; }
}
