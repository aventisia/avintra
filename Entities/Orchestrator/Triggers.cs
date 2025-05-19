using Microsoft.AspNetCore.Components;

namespace WorkspaceAPIs.Entities;
public class Triggers : BaseEntity, IMustHaveTenant
{
    [Required]
    public Guid TenantId { get; set; }

    /// <summary>
    /// Get or set the Name of the trigger (max length 256)
    /// </summary>
    [Required, MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// Represents the environment of the trigger, e.g., Development, UAT, Production
    /// </summary>
    [Required]
    public required EnvironmentTypesEnum Environment { get; set; }

    /// <summary>
    /// Timezone of the trigger
    /// </summary>
    [Required, MaxLength(100)]
    public required string Timezone { get; set; }

    /// <summary>
    /// Represents the timestamp of when the trigger starts
    /// </summary>
    public DateTime StartsOn { get; set; }


    /// <summary>
    /// Frequency of the trigger
    /// </summary>
    [Required]
    public required TriggerFrequencyTypesEnum Frequency { get; set; }

    /// <summary>
    /// repeat at show the time of the day for trigger to execute it can be hours , minutes or date-time for one time
    /// </summary>
    public DateTime RepeateAt { get; set; }

    /// <summary>
    /// Represents the trigger specificity for weekday or day of the monts
    /// </summary>
    public string[]? RepeateOn { get; set; } = [];

    /// <summary>
    /// Represents the count of repeatation like every 2 months every 2 weeks
    /// </summary>
    public int? RepeateEvery { get; set; }


    /// <summary>
    /// Represents the is the trigger has non working days
    /// </summary>
    public bool HasNonWorkingDays { get; set; }

    /// <summary>
    /// Represents the timestamps of trigger non working days
    /// </summary>
    public DateTime[]? NonWorkingDays { get; set; } = [];


    /// <summary>
    /// Represents the is the trigger has non working time
    /// </summary>
    public bool HasNonWorkingTime { get; set; }

    /// <summary>
    /// Represents the timestamp of trigger non working time from
    /// </summary>
    public DateTime? NonWorkingTimeFrom { get; set; }

    /// <summary>
    /// Represents the timestamp of trigger non working time to
    /// </summary>
    public DateTime? NonWorkingTimeTo { get; set; }


    /// <summary>
    /// Represents the is the trigger ends
    /// </summary>
    public bool IsEnds { get; set; }

    /// <summary>
    /// Represents the timestamp of when the trigger ends
    /// </summary>
    public DateTime? EndsOn { get; set; }


    /// <summary>
    /// Represents the weather to trigger for new item arried in work item list
    /// </summary>
    public bool TriggerForNewItem { get; set; }


    /// <summary>
    /// Represents the weather to trigger for new email arries.
    /// </summary>
    public bool TriggerForNewEmail { get; set; }

    /// <summary>
    /// Represents the weather to diable trigger automaticaly
    /// </summary>
    public bool DisableAutomaticaly { get; set; }

    /// <summary>
    /// Represents the weather to add alert for the trigger when stucked
    /// </summary>
    public bool HasStuckAlert { get; set; }

    /// <summary>
    /// Represents the weather to add alert for the trigger when failed
    /// </summary>
    public bool HasFailedAlert { get; set; }


    /// <summary>
    /// Many-to-Many relationship with Flows, representing the trigger's associated flow activities
    /// </summary>
    public virtual ICollection<TriggersFlowVersion> TriggerFlowVersions { get; set; } = [];
}
