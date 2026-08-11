using WorkspaceAPIs.DTOs;
using WorkspaceAPIs.Entities;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides helpers for resolving the full set of statuses available to a queue
/// (the core system statuses plus any queue-specific custom statuses) and for
/// validating status transitions.
/// </summary>
public interface IQueueStatusService
{
    /// <summary>
    /// Gets the queue-specific custom statuses (excluding the core system statuses).
    /// </summary>
    List<QueueStatusDefinitionDto> GetCustomStatuses(Queue? queue);

    /// <summary>
    /// Gets the full ordered list of statuses for a queue: the core system statuses
    /// followed by any queue-specific custom statuses.
    /// </summary>
    List<string> GetAllStatuses(Queue? queue);

    /// <summary>
    /// Determines whether the given status is a valid status for the queue.
    /// </summary>
    bool IsValidStatus(Queue? queue, string? status);

    /// <summary>
    /// Determines whether a transition from <paramref name="fromStatus"/> to
    /// <paramref name="toStatus"/> is allowed for the queue. Custom disposition statuses
    /// are always terminal (end) states, so a work item in a disposition status cannot
    /// transition to any other status.
    /// </summary>
    bool IsTransitionAllowed(Queue? queue, string? fromStatus, string? toStatus);

    /// <summary>
    /// Gets the name of the destination queue to which a work item should be routed
    /// when the given disposition status is selected, or <c>null</c> if the status
    /// does not define a route queue.
    /// </summary>
    string? GetRouteQueue(Queue? queue, string? status);
}
