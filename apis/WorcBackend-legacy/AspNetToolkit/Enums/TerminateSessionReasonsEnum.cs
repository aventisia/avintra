namespace AspNetToolkit.Enums;

/// <summary>
/// Enum represents the reasons for terminating a session.. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum TerminateSessionReasonsEnum
{
    [Description("User has logged off")]
    UserHasLoggedOff,

    [Description("Session terminated by user")]
    SessionTerminatedByUser,

    [Description("Session has expired")]
    SessionHasExpired
}