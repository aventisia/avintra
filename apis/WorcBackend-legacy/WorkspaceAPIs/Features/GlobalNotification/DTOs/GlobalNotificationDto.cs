namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a global notification.
/// </summary>
public class GlobalNotificationDto
{
    /// <summary>
    /// Gets or sets the notification record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the message of the notification. Max 500 characters.
    /// </summary>
    [StringLength(500)]
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets the type of the notification.
    /// </summary>
    public required NotificationTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the action URL associated with the notification. Max 1000 characters.
    /// </summary>
    [StringLength(1000)]
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}