namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents the assignment of a user to a custom UI builder project within the context of a tenant.
/// </summary>
public class UiBuilderProjectUser : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier (primary key) for the UI builder project user record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant ID associated with this UI builder project user.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the UI builder project this user is associated with.
    /// </summary>
    [ForeignKey("UiBuilderProjectId")]
    public virtual UiBuilderProject? UiBuilderProject { get; set; }

    /// <summary>
    /// Gets or sets the ID of the UI builder project.
    /// </summary>
    public required Guid UiBuilderProjectId { get; set; }

    /// <summary>
    /// Gets or sets the workspace user associated with this UI builder project.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual WorkspaceUser? User { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user.
    /// </summary>
    public required Guid UserId { get; set; }
}
