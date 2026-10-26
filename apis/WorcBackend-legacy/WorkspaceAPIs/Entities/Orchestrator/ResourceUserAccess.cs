namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents sharing permissions granted to a user for a resource within a tenant.
/// </summary>
[Table("user_ResourceUserAccess")]
// TODO: Remove this temporary migration code after all legacy user mapping data
// (FlowUser and QueueUser) has been successfully migrated
// to ResourceUserAccess in all environments.
// public class ResourceUserAccess : IMustHaveTenant

public class ResourceUserAccess
{
    /// <summary>
    /// Gets or sets the unique identifier of the resource user access record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant identifier that owns the resource user access.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type of resource being shared.
    /// </summary>
    public ResourceTypeEnum ResourceType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the shared resource.
    /// </summary>
    public required Guid ResourceId { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user receiving access.
    /// </summary>
    public required Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the user receiving access to the resource.
    /// </summary>
    [ForeignKey(nameof(UserId))]
    public virtual WorkspaceUser? User { get; set; }
}