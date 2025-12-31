namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Many-to-Many relationship representing a user's access and association with a specific AI project within a tenant.
/// </summary>
/// <remarks>
/// - All users in the workspace automatically have view access to the project. <br/>
/// - This entity is used to assign additional permissions (such as edit or owner) to specific users. <br/>
/// - View access is controlled by the user's access to the workspace and the workspace's access to the project,
/// so only extra permissions beyond view are stored here.
/// </remarks>
[Table("as_AIProjectUsers")]
public class AIProject_User : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant Id for multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the Id of the user linked to this project.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the Id of the project linked to this user.
    /// </summary>
    public Guid AIProjectId { get; set; }

    /// <summary>
    /// Gets or sets the user's access level to the project (Owner, Edit).
    /// </summary>
    public ProjectUserAccessEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the navigation reference to the user.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual ModelBuilderUser? User { get; set; }

    /// <summary>
    /// Gets or sets the navigation reference to the project.
    /// </summary>
    [ForeignKey("AIProjectId")]
    public virtual AIProject? AIProject { get; set; }
}