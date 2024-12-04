namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an entity that stores flow log data.
/// </summary>

public class FlowLog : BaseEntity
{
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the flow this comment is associated with.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }
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
    [MaxLength(50)]
    public string  Status { get; set; }

    /// <summary>
    /// Gets or sets the duration of the flow log. Represents the time span.
    /// </summary>
    public TimeSpan Duration { get; set; } = TimeSpan.Zero;


}