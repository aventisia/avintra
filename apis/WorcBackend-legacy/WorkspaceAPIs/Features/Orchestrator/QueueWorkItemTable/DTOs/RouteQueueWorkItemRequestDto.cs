namespace WorkspaceAPIs.DTOs;

public class RouteQueueWorkItemRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the work item to be routed.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the destination queue where the work item will be routed.
    /// </summary>
    [StringLength(255)]
    public required string QueueName { get; set; }
}