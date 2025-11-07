using System.ComponentModel.DataAnnotations;
namespace WorkspaceAPIs.Entities;

[Table("worc_TimeTriggers")]
public class TimeTrigger: BaseEntity,IMustHaveTenant
{
    public Guid TenantId { get; set; }
    public required string Name { get; set; }
    public required string Timezone { get; set; }
    public required TriggerFrequencyTypesEnum Frequency { get; set; }
    public required string SetupObject {get;set;} 
    public required DateTimeOffset EffectiveDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public DateTimeOffset LastTriggeredTime { get; set; }
    public DateTimeOffset NextTriggerTime { get; set; }
    public List<int>? ExceptionHours { get; set; }
    public List<DayOfWeek>? ExceptionWeekdays { get; set; }
    public List<DateTime>? ExceptionDates {get;set;}
    public virtual ICollection<TimeTriggersFlowVersion> TimeTriggerFlowVersions { get; set; } = [];
}
