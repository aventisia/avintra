namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a project.
/// </summary>
public class TimeTriggerDto
{
    /// <summary>
    /// Gets or sets the flow record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the TenantId
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the Trigger Name
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the Timezone
    /// </summary>
    public required string Timezone { get; set; }

    /// <summary>
    /// Gets or sets the Frequency
    /// </summary>
    public required TriggerFrequencyTypesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the SetupObject
    /// </summary>
    
    public required string SetupObject {get;set;}
    // The date and time when the time trigger becomes active. This marks the start of the trigger's activation.
    public required DateTimeOffset EffectiveDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public DateTimeOffset LastTriggeredTime { get; set; }
    public DateTimeOffset NextTriggerTime { get; set; }
    public List<int>? ExceptionHours { get; set; }
    public List<DayOfWeek>? ExceptionWeekdays { get; set; }
    public List<DateTime>? ExceptionDates {get;set;}
   
    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}            