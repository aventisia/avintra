namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents sharing permissions granted to a user for a resource within a tenant.
/// </summary>
[Table("worc_ResourceShares")]
// TODO: Remove this temporary migration code after all legacy user mapping data
// (FlowUser and QueueUser) has been successfully migrated
// to ResourceShare in all environments.
// public class ResourceShare : IMustHaveTenant

public class ResourceShare
{
    /// <summary>
    /// Gets or sets the unique identifier of the resource share record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant identifier that owns the resource share.
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