namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the possible statuses of an OnPrem model.
/// </summary>
public enum OnPremModelStatusEnum
{
    /// <summary>
    /// The model is currently being downloaded.
    /// </summary>
    [Description("The model is in the process of being downloaded.")]
    Downloading,

    /// <summary>
    /// The model has been successfully installed and is ready for use.
    /// </summary>
    [Description("The model has been successfully installed and is ready to use.")]
    Installed,

    /// <summary>
    /// The model has been uninstalled and is no longer available.
    /// </summary>
    [Description("The model has been removed and is no longer available for use.")]
    Uninstalled
}
