namespace AspNetToolkit.Entities;

/// <summary>
/// Strongly-typed model of the per-tenant, per-notification-type automatic notification
/// control flags. Stored as a JSON column on the Tenant entity.
/// </summary>
/// <remarks>
/// Each property maps to a single controllable automatic notification type. Properties
/// default to <see langword="false"/> so that a missing key in the stored JSON falls back
/// to the per-type default (FR-6, FR-6a). Adding a new notification type requires only
/// adding a property here (and a UI row) — no schema migration (FR-11).
/// </remarks>
public class NotificationSettings
{
    /// <summary>
    /// Gets or sets a value indicating whether the "Low Credit" automatic notification is
    /// enabled for the tenant. When enabled, tenant admins are notified when the credit
    /// balance falls below the configured threshold.
    /// </summary>
    public bool LowCredits { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether the "Subscription" automatic notification is
    /// enabled for the tenant. When enabled, tenant admins are notified of an upcoming
    /// subscription renewal.
    /// </summary>
    public bool Subscription { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether the "Publish Agent" automatic notification is
    /// enabled for the tenant. When enabled, orchestrator managers are notified when an agent
    /// is published and ready for use.
    /// </summary>
    public bool PublishAgent { get; set; } = false;
}
