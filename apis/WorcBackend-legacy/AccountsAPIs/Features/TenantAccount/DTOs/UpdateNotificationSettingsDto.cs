namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a partial update to a tenant's automatic notification control settings.
/// </summary>
/// <remarks>
/// This is the update/request DTO. Each property is a nullable boolean so that omitted
/// properties are left unchanged:
/// <list type="bullet">
///   <item><see langword="true"/> — enable the notification type.</item>
///   <item><see langword="false"/> — disable the notification type.</item>
///   <item><see langword="null"/> (or absent) — leave the current value unchanged.</item>
/// </list>
/// This supports true partial updates (PATCH semantics) without requiring the client to
/// send the full settings object.
/// </remarks>
public class UpdateNotificationSettingsDto
{
    /// <summary>
    /// Gets or sets the desired state for the "Low Credit" automatic notification.
    /// <see langword="null"/> means no change.
    /// </summary>
    public bool? LowCredits { get; set; }

    /// <summary>
    /// Gets or sets the desired state for the "Subscription" automatic notification.
    /// <see langword="null"/> means no change.
    /// </summary>
    public bool? Subscription { get; set; }

    /// <summary>
    /// Gets or sets the desired state for the "Publish Agent" automatic notification.
    /// <see langword="null"/> means no change.
    /// </summary>
    public bool? PublishAgent { get; set; }
}
