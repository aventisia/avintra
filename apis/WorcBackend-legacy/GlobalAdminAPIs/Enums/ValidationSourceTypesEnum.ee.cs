namespace GlobalAdminAPIs.Enums;

/// <summary>
/// Represents the source of validation for an OnPremInstance.
/// </summary>
public enum ValidationSourceTypesEnum
{
    /// <summary>
    /// The validation was performed by a background service.
    /// </summary>
    [Description("The validation was performed by a background service.")]
    BackgroundService,

    /// <summary>
    /// The validation was performed during the startup process.
    /// </summary>
    [Description("The validation was performed during the startup process.")]
    StartUpService
}