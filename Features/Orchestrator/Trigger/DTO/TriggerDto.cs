namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a project.
/// </summary>
public class TriggerDto
{
    /// <summary>
    /// Gets or sets the flow record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    /// <summary>
    /// Get or set the Name of the trigger (max length 256)
    /// </summary>
    [Required, MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// Get or set the environment of the trigger.
    /// </summary>
    [Required]
    public required EnvironmentTypesEnum Environment { get; set; }

    /// <summary>
    /// Get or set the time zone of the trigger.
    /// </summary>
    [Required]
    public required string Timezone { get; set; }

    /// <summary>
    /// Gets or sets the collection of unique identifiers for agents(flow version) associated with the user.
    /// This property may be included in requests and responses.
    /// </summary>
    public IEnumerable<Guid>? AgentIds { get; set; }

    /// <summary>
    /// Get or set the starting time of the trigger.
    /// </summary>
    [Required]
    public required DateTime StartsOn { get; set; }

    /// <summary>
    /// Get or set the frequency of the trigger.
    /// </summary>
    public required TriggerFrequencyTypesEnum Frequency { get; set; }

    /// <summary>
    /// Get or set the time of execution of the trigger.
    /// </summary>
    public DateTime? RepeateAt { get; set; }

    /// <summary>
    /// Get or set the weekday or day of month of the trigger.
    /// </summary>
    public string[]? RepeateOn { get; set; } = [];

    /// <summary>
    /// Get or set the repeataion of the trigger. like every 2 monts or every 2 weeks etc..
    /// </summary>
    public int? RepeateEvery { get; set; }


    /// <summary>
    /// Get or set non working days capability of trigger.
    /// </summary>
    public bool HasNonWorkingDays { get; set; }

    /// <summary>
    /// Get or set non working days of trigger.
    /// </summary>
    public DateTime[]? NonWorkingDays { get; set; } = [];

    /// <summary>
    /// Get or set non working time capability of trigger.
    /// </summary>
    public bool HasNonWorkingTime { get; set; }

    /// <summary>
    /// Get or set non working from time of trigger.
    /// </summary>
    public DateTime? NonWorkingTimeFrom { get; set; }

    /// <summary>
    /// Get or set non working to time of trigger.
    /// </summary>
    public DateTime? NonWorkingTimeTo { get; set; }

    /// <summary>
    /// Get or set wheather trigger is ending or stop repeating.
    /// </summary>
    public bool IsEnds { get; set; }

    /// <summary>
    /// Get or set ending time of the trigger.
    /// </summary>
    public DateTime? EndsOn { get; set; }

    /// <summary>
    /// Get or set wheather trigger is executes when new item arried in work itme list.
    /// </summary>
    public bool TriggerForNewItem { get; set; }

    /// <summary>
    /// Get or set wheather trigger is executes when new email arries.
    /// </summary>
    public bool TriggerForNewEmail { get; set; }


    public bool DisableAutomaticaly { get; set; }
    public bool HasStuckAlert { get; set; }
    public bool HasFailedAlert { get; set; }

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