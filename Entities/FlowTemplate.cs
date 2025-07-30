namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an entity that holds the data for a Worc template.
/// </summary>
public class WorcTemplate : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant associated with this record.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the Worc template. Maximum length of 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the Worc template. Maximum length of 500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the JSON representation of the Worc template's nodes, edges, and viewport. 
    /// Defaults to an empty object if not provided.
    /// </summary>
    public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    /// <summary>
    /// Gets or sets the category for the Worc template (e.g., Workflow, Automation, etc.).
    /// </summary>
    [MaxLength(50)]
    public FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the number of times the template has been used to create flows. 
    /// This helps in tracking popular or trending templates.
    /// </summary>
    public int UsagesCount { get; set; }

    /// <summary>
    /// Gets or sets the access type, which defines the user's access level within the flow.
    /// </summary>
    public AccessTypesEnum? AccessType { get; set; }

    /// <summary>
    /// Gets or sets a list of tags associated with the worc template.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets a list of icons or avatars associated with the template.
    /// </summary>
    public List<string>? Icons { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the version of the flow version.
    /// </summary>
    public Guid RefId { get; set; }
}
