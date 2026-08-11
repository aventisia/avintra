namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the source/discriminator of a Notification. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum NotificationSourceEnum
{
    /// <summary>
    /// Represents a notification created manually by an admin.
    /// </summary>
    Manual,

    /// <summary>
    /// Represents a system-generated notification when a new ticket or change request is created.
    /// </summary>
    NewTicket,

    /// <summary>
    /// Represents a system-generated notification when a support ticket is updated.
    /// </summary>
    TicketUpdate,

    /// <summary>
    /// Represents a system-generated notification when a comment is posted on a support ticket.
    /// </summary>
    TicketComment,

    /// <summary>
    /// Represents a system-generated notification when an agent is published.
    /// </summary>
    AgentPublished,

    /// <summary>
    /// Represents a system-generated notification when a tenant's credit
    /// balance falls below the configured threshold.
    /// </summary>
    LowCredit,

    /// <summary>
    /// Represents a system-generated notification reminding the tenant admin
    /// of an upcoming subscription renewal.
    /// </summary>
    SubscriptionRenewal
}
