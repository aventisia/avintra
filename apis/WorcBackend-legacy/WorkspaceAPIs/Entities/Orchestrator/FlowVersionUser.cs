namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a Flow Version User, linking a user to a specific Flow Version in the context of a tenant.
/// </summary>
[Table("worc_FlowVersionUsers")]
public class FlowVersionUser : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier (primary key) for the flow version user record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant ID associated with this flow version user.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the Flow Version this user is associated with.
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Gets or sets the ID of the Flow Version.
    /// </summary>
    public required Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the workspace user associated with this flow version.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual WorkspaceUser? User { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user.
    /// </summary>
    public required Guid UserId { get; set; }
}