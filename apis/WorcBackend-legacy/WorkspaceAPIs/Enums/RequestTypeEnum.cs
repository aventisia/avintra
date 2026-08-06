namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the type of request for a support ticket.
/// </summary>
public enum RequestTypeEnum
{
    /// <summary>
    /// A request for a new service.
    /// </summary>
    [Description("Service request.")]
    ServiceRequest,

    /// <summary>
    /// A request to change an existing service.
    /// </summary>
    [Description("Change request.")]
    ChangeRequest
}
