namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a project template, including metadata, structure, access settings, usage details, and audit information.
/// </summary>
public class ProjectTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the project template.
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
    public TemplateAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the space where the agent template is applicable.
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the JSON schema that defines the template's structure and rules.
    /// </summary>
    public string? Schema { get; set; }

    /// <summary>
    /// Gets or sets the version number of the associated schema.
    /// </summary>
    public int SchemaVersion { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the referenced flow or model version linked to this template.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets a collection of tags associated with the template for categorization or search.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the number of times this template has been used to create models or flows.
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// Gets or sets a collection of icons or avatars that visually represent the template.
    /// </summary>
    public List<string>? Icons { get; set; }

    /// <summary>
    /// Gets or sets the collection of resource files associated with the project template.
    /// </summary>
    public IEnumerable<TemplateResourceDto>? Resources { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was last modified.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}