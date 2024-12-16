namespace WorkspaceAPIs.DTOs;

public class FlowLogDto
{
    public Guid Id { get; set; }
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was start modified.
    /// </summary>
    public DateTimeOffset StartTime { get; set; } 

    /// <summary>
    /// Gets or sets the type of the status Max-20 characters.
    /// </summary>
   
    public FlowLogStatusEnum  Status { get; set; }

    /// <summary>
    /// Gets or sets the duration of the flow log. Represents the time span.
    /// </summary>
    public long Duration { get; set; } 

    /// <summary>
    /// Gets or sets the Remark Max-500 characters.
    /// </summary>
    public string Remark { get; set; }

    /// <summary>
    /// Gets or sets the version
    /// </summary>
    public float Version {get;set;}

    public string flowName { get; set; }
}