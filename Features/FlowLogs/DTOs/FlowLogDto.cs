namespace WorkspaceAPIs.DTOs;

public class FlowLogDto
{
    public Guid FlowId { get; set; }
    
    /// <summary>
    /// Gets or sets the name of the flow. Max-255 characters.
    /// </summary>

    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was start modified.
    /// </summary>
    public DateTimeOffset StartTime { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the type of the status Max-20 characters.
    /// </summary>
   
    public FlowLogStatusEnum  Status { get; set; }

    /// <summary>
    /// Gets or sets the duration of the flow log. Represents the time span.
    /// </summary>
     public DateTimeOffset Duration { get; set; } 
}