namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents an entity that holds data for an ML model template.
/// </summary>
public class MLModelTemplate : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier of the tenant associated with this template.
    /// </summary>
    [Required]
    public Guid TenantId { get; set; }


    /// <summary>
    /// Gets or sets a description of the ML model template. Maximum length is 500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the number of times this template has been used to create ML models.
    /// This helps track the popularity or frequency of use of the template.
    /// </summary>
    [Range(0, int.MaxValue)]
    public int UsagesCount { get; set; }

    /// <summary>
    /// Gets or sets the access type, which defines the user's access level within the flow.
    /// </summary>
    public AccessTypesEnum? AccessType { get; set; }

    /// <summary>
    /// Gets or sets a list of tags associated with the machine learning model version.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Gets or sets the identifier of the ML model version to which this template is associated.
    /// </summary>
    [Required]
    public required Guid MLModelVersionId { get; set; }

    /// <summary>
    /// Gets or sets the associated ML model version for this template.
    /// </summary>
    [ForeignKey(nameof(MLModelVersionId))]
    public virtual MLModelVersion? MLModelVersion { get; set; }
}
