namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the subscription information and retention policy for a tenant.
/// </summary>
public class TenantSubscriptionInfoDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the duration (in days) for which workflow execution history is retained.
    /// </summary>
    public int HistoryRetentionDays { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the tenant's subscription.
    /// </summary>
    public Guid SubscriptionId { get; set; }
}