namespace WorkspaceAPIs.DTOs;

public class MoveQueueWorkItemRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the transaction or flow being moved.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the destination queue name where the transaction will be moved.
    /// </summary>
    [StringLength(255)]
    public required string QueueName { get; set; }
}