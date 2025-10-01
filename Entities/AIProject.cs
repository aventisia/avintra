namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents an AI project entity, including its metadata, type, description, versions, and associated users. Supports multi-tenancy.
/// </summary>
[Table("as_AIProjects")]
public class AIProject : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant Id for multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the AI project. Max 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of AI project (Inferencing, Conversational, Generative)
    /// </summary>
    public AIProjectTypeEnum? Type { get; set; }

    /// <summary>
    /// Gets or sets the description of AI project. Max 1000 characters.
    /// </summary>
    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the versions associated with this AI project.
    /// </summary>
    public virtual ICollection<AIProjectVersion>? Versions { get; set; }

    /// <summary>
    /// Gets or sets the users associated with this AI project.
    /// </summary>
    public virtual ICollection<AIProject_User>? ProjectUsers { get; set; }
}