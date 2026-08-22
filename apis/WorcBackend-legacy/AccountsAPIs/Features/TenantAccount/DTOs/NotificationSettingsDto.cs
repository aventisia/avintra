namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the full set of per-tenant automatic notification control settings.
/// Each property maps to a single controllable notification type and indicates whether
/// that type is currently enabled for the tenant.
/// </summary>
/// <remarks>
/// This is the read/response DTO. It uses strongly typed boolean properties (rather than
/// a dynamic key/value list) so the API contract is explicit, self-documenting, and
/// compile-time checked. Missing settings are resolved to the per-type default before
/// this DTO is populated, so callers always receive a concrete <see langword="bool"/>.
/// </remarks>
public class NotificationSettingsDto
{
    /// <summary>
    /// Gets or sets the unique identifier (ID) of the tenant these settings belong to.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the "Low Credit" automatic notification
    /// is enabled for the tenant. When enabled, tenant admins are notified when the
    /// credit balance falls below the configured threshold.
    /// </summary>
    public bool LowCredits { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the "Subscription" automatic notification
    /// is enabled for the tenant. When enabled, tenant admins are notified of an upcoming
    /// subscription renewal.
    /// </summary>
    public bool Subscription { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the "Publish Agent" automatic notification
    /// is enabled for the tenant. When enabled, orchestrator managers are notified when an
    /// agent is published and ready for use.
    /// </summary>
    public bool PublishAgent { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the "Agent Risk Assessment Approval" automatic
    /// notification is enabled for the tenant. When enabled, the designated approver is
    /// notified when an agent risk assessment is submitted for approval.
    /// </summary>
    public bool AgentRiskAssessmentApproval { get; set; }

    /// <summary>
    /// Gets or sets the number of days before the subscription renewal date at which the
    /// renewal reminder starts being sent to the Tenant Admin. Required and must be greater
    /// than zero. Defaults to 7.
    /// </summary>
    public int SubscriptionRenewalReminderDays { get; set; } = 7;

    /// <summary>
    /// Gets or sets the credit balance threshold below which the Tenant Admin is notified
    /// that the credit balance is low. Required and must be greater than zero. Defaults to 1000.
    /// </summary>
    public double LowCreditThreshold { get; set; } = 1000;

    /// <summary>
    /// Gets or sets the delivery channel used for automatic notifications.
    /// Supported values: Platform, Email, or Both. Defaults to Both.
    /// </summary>
    public DeliveryChannelEnum DeliveryChannel { get; set; } = DeliveryChannelEnum.Both;
}
