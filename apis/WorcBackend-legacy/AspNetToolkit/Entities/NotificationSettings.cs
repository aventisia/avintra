namespace AspNetToolkit.Entities;

using System.ComponentModel.DataAnnotations;

/// <summary>
/// Strongly-typed model of the per-tenant, per-notification-type automatic notification
/// control flags. Stored as a JSON column on the Tenant entity.
/// </summary>
/// <remarks>
/// Each property maps to a single controllable automatic notification type. Properties
/// default to <see langword="true"/> so that all notification types are enabled by default
/// (FR-6, FR-6a). Adding a new notification type requires only adding a property here
/// (and a UI row) — no schema migration (FR-11).
/// </remarks>
public class NotificationSettings
{
    /// <summary>
    /// Gets or sets a value indicating whether the "Low Credit" automatic notification is
    /// enabled for the tenant. When enabled, tenant admins are notified when the credit
    /// balance falls below the configured threshold.
    /// </summary>
    public bool LowCredits { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether the "Subscription" automatic notification is
    /// enabled for the tenant. When enabled, tenant admins are notified of an upcoming
    /// subscription renewal.
    /// </summary>
    public bool Subscription { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether the "Publish Agent" automatic notification is
    /// enabled for the tenant. When enabled, orchestrator managers are notified when an agent
    /// is published and ready for use.
    /// </summary>
    public bool PublishAgent { get; set; } = true;

    /// <summary>
    /// Gets or sets the number of days before the subscription renewal date at which the
    /// renewal reminder starts being sent to the Tenant Admin. Required and must be greater
    /// than zero. Defaults to 7.
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "SubscriptionRenewalReminderDays must be greater than 0.")]
    public int SubscriptionRenewalReminderDays { get; set; } = 7;

    /// <summary>
    /// Gets or sets the credit balance threshold below which the Tenant Admin is notified
    /// that the credit balance is low. Required and must be greater than zero. Defaults to 1000.
    /// </summary>
    [Range(1, double.MaxValue, ErrorMessage = "LowCreditThreshold must be greater than 0.")]
    public double LowCreditThreshold { get; set; } = 1000;

    /// <summary>
    /// Gets or sets the delivery channel used for automatic notifications.
    /// Supported values: <see cref="DeliveryChannelEnum.Platform"/>,
    /// <see cref="DeliveryChannelEnum.Email"/>, or <see cref="DeliveryChannelEnum.Both"/>.
    /// Defaults to <see cref="DeliveryChannelEnum.Both"/>.
    /// </summary>
    public DeliveryChannelEnum DeliveryChannel { get; set; } = DeliveryChannelEnum.Both;
}
