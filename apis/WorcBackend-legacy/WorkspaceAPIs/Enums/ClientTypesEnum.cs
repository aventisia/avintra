namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the types of clients that can interact with the system.
/// </summary>
public enum ClientTypesEnum
{
    /// <summary>
    /// A user accessing the system through a web browser (desktop or mobile).
    /// </summary>
    [Description("A user accessing the system via a web browser.")]
    WebBrowser,

    /// <summary>
    /// A user interacting with the system via a desktop application, typically with offline support and advanced features.
    /// </summary>
    [Description("A user accessing the system via a desktop application.")]
    AvintraDesktopApp,

    /// <summary>
    /// An automated machine performing tasks and system operations without direct user interaction.
    /// </summary>
    [Description("An automated machine performing tasks and system operations.")]
    AvintraMachine
}
