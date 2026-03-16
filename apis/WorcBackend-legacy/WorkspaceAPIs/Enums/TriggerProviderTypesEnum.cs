namespace WorkspaceAPIs.Enums;

/// <summary>
/// Represents the supported provider types for trigger subscriptions.
/// These providers define the email platform used for mailbox monitoring.
/// </summary>
public enum TriggerProviderTypesEnum
{
    /// <summary>
    /// Microsoft 365 email service provider.
    /// </summary>
    [Description("Microsoft 365")]
    M365,

    /// <summary>
    /// Google Workspace email service provider.
    /// </summary>
    [Description("Google Workspace")]
    Google,

    /// <summary>
    /// Generic IMAP-based email provider.
    /// </summary>
    [Description("IMAP")]
    IMAP
}