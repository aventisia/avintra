using WorkspaceAPIs.DTOs;
using WorkspaceAPIs.Entities;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides helpers for resolving the full set of statuses available to a queue
/// (the core system statuses plus any queue-specific custom statuses) and for
/// validating status transitions.
/// </summary>
public class QueueStatusService : IQueueStatusService
{
    /// <summary>
    /// The core system statuses that are always available on every queue.
    /// </summary>
    public static readonly IReadOnlyList<string> CoreStatuses = new[]
    {
        QueueTransactionStatusTypesEnum.Pending.ToString(),
        QueueTransactionStatusTypesEnum.InProgress.ToString(),
        QueueTransactionStatusTypesEnum.Completed.ToString(),
        QueueTransactionStatusTypesEnum.Failed.ToString(),
    };

    /// <inheritdoc />
    public List<QueueStatusDefinitionDto> GetCustomStatuses(Queue? queue)
    {
        if (queue == null || string.IsNullOrWhiteSpace(queue.Statuses))
        {
            return new List<QueueStatusDefinitionDto>();
        }

        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<QueueStatusDefinitionDto>>(
                       queue.Statuses,
                       new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                   ?? new List<QueueStatusDefinitionDto>();
        }
        catch (System.Text.Json.JsonException)
        {
            return new List<QueueStatusDefinitionDto>();
        }
    }

    /// <inheritdoc />
    public List<string> GetAllStatuses(Queue? queue)
    {
        var statuses = new List<string>(CoreStatuses);

        foreach (var custom in GetCustomStatuses(queue))
        {
            if (!string.IsNullOrWhiteSpace(custom.Name) &&
                !statuses.Contains(custom.Name, StringComparer.OrdinalIgnoreCase))
            {
                statuses.Add(custom.Name);
            }
        }

        return statuses;
    }

    /// <inheritdoc />
    public bool IsValidStatus(Queue? queue, string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return false;
        }

        return GetAllStatuses(queue).Contains(status, StringComparer.OrdinalIgnoreCase);
    }

    /// <inheritdoc />
    public bool IsTransitionAllowed(Queue? queue, string? fromStatus, string? toStatus)
    {
        // A null target status is treated as "no change" and is always allowed.
        if (string.IsNullOrWhiteSpace(toStatus))
        {
            return true;
        }

        // The target status must be a valid status for the queue.
        if (!IsValidStatus(queue, toStatus))
        {
            return false;
        }

        // If there is no source status, any valid target is allowed.
        if (string.IsNullOrWhiteSpace(fromStatus))
        {
            return true;
        }

        // Custom disposition statuses are always terminal (end) states, so a work item
        // in a disposition status cannot transition to any other status.
        var customStatuses = GetCustomStatuses(queue);
        var source = customStatuses.FirstOrDefault(s =>
            string.Equals(s.Name, fromStatus, StringComparison.OrdinalIgnoreCase));

        if (source != null)
        {
            return false;
        }

        // The source is a core system status; allow any valid target.
        return true;
    }

    /// <inheritdoc />
    public string? GetRouteQueue(Queue? queue, string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return null;
        }

        var custom = GetCustomStatuses(queue).FirstOrDefault(s =>
            string.Equals(s.Name, status, StringComparison.OrdinalIgnoreCase));

        return string.IsNullOrWhiteSpace(custom?.RouteQueue) ? null : custom.RouteQueue;
    }
}
