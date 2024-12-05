namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an entity that stores flow log data.
/// </summary>

public class FlowLog : IMustHaveTenant
{
     /// <summary>
    /// Gets or sets the primary key of the FlowLog record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the flow this comment is associated with.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was start modified.
    /// </summary>
    public DateTimeOffset StartTime { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the type of the status Max-20 characters.
    /// </summary>
    [MaxLength(200)]
    public FlowLogStatusEnum  Status { get; set; }

    /// <summary>
    /// Gets or sets the duration of the flow log. Represents the time span.
    /// </summary>
     public long Duration { get; set; } 

     public float Version {get;set;}

    [MaxLength(500)]
     public string Remark { get; set; }
    public Guid TenantId {get;set;}
}