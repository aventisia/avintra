namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the various client types that can interact with the system.
/// </summary>
public enum ClientTypesEnum
{
    /// <summary>
    /// A user accessing the system via a web browser.
    /// </summary>
    [Description("A user accessing the system via a web browser.")]
    WebBrowserUser,

    /// <summary>
    /// A user interacting with the system through a desktop application.
    /// </summary>
    [Description("A user interacting with the system through a desktop application.")]
    DesktopAppUser,

    /// <summary>
    /// An automated machine that uses agent execution to perform tasks and assist with system operations.
    /// </summary>
    [Description("An automated machine that uses agent execution to perform tasks and assist with system operations.")]
    AssistAppMachine
}
