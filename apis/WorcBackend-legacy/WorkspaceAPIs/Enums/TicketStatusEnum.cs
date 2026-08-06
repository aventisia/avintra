namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the lifecycle status of a support ticket.
/// </summary>
public enum TicketStatusEnum
{
    /// <summary>
    /// The ticket has been created and is not yet reviewed.
    /// </summary>
    [Description("New ticket.")]
    New,

    /// <summary>
    /// The ticket is being worked on.
    /// </summary>
    [Description("Ticket is in progress.")]
    InProgress,

    /// <summary>
    /// The ticket has been closed.
    /// </summary>
    [Description("Ticket has been closed.")]
    Closed
}
