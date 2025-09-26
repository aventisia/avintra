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

    /// <summary>
    /// Gets or sets the version number used for row versioning. Row versioning helps detect conflicts between concurrent transactions.
    /// </summary>
    /// <remarks>
    /// It is a hidden system column and won't be visible in table's column list.
    /// For more information, see https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }
}

// namespace MLModelBuilderAPIs.Entities;

// /// <summary>
// /// Represents a user's access and association with a specific ML model within a tenant.
// /// </summary>
// [Table("MLModelUsers")]
// public class MLModelUser : BaseEntity, IMustHaveTenant
// {
//     /// <summary>
//     /// Gets or sets the tenant ID for multi-tenancy support.
//     /// </summary>
//     public Guid TenantId { get; set; }

//     /// <summary>
//     /// Gets or sets the user's access type for the associated ML model.
//     /// </summary>
//     public AgentAccessTypesEnum AccessType { get; set; }

//     /// <summary>
//     /// Gets or sets the ID of the user linked to the ML model.
//     /// </summary>
//     public Guid UserId { get; set; }

//     /// <summary>
//     /// Gets or sets the navigation reference to the user.
//     /// </summary>
//     [ForeignKey("UserId")]
//     public virtual ModelBuilderUser? User { get; set; }

//     /// <summary>
//     /// Gets or sets the ID of the associated ML model.
//     /// </summary>
//     public Guid MLModelId { get; set; }

//     /// <summary>
//     /// Gets or sets the navigation reference to the ML model.
//     /// </summary>
//     [ForeignKey("MLModelId")]
//     public virtual MLModel? MLModel { get; set; }
// }
