namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Lightweight data transfer object describing a queue linked to an agent (flow version).
/// Used on the Assist agents screen to render the queues each agent is servicing.
/// </summary>
public class AgentQueueDto
{
    /// <summary>
    /// Gets or sets the Id of the queue.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the queue.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the queue.
    /// </summary>
    public QueueTypesEnum Type { get; set; }
}
