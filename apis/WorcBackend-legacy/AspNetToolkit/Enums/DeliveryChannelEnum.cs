namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the delivery channel of a Notification. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum DeliveryChannelEnum
{
    /// <summary>
    /// Represents delivery via email.
    /// </summary>
    Email,

    /// <summary>
    /// Represents delivery via the in-app platform (bell icon).
    /// </summary>
    Platform,

    /// <summary>
    /// Represents delivery via both email and the in-app platform.
    /// </summary>
    Both
}
