namespace WorkspaceAPIs.MappingProfiles;

public class TimeTriggerMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping: Trigger entity → TimeTriggerDto
        // Used for retrieving time-based triggers with audit and configuration details
        config.NewConfig<Trigger, TimeTriggerDto>()
            .AfterMapping((src, dest) =>
            {
                // Safely deserialize trigger metadata
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };
                jsonOptions.Converters.Add(new JsonStringEnumConverter());

                var model = System.Text.Json.JsonSerializer.Deserialize<TimeTriggerModel>(
                    src.Metadata.RootElement.GetRawText(),
                    jsonOptions
                );

                if (model != null)
                {
                    dest.NextTriggerTime = model.NextTriggerTime;
                    dest.CronExpression = model.CronExpression;
                    dest.LastTriggeredTime = model.LastTriggeredTime;
                    dest.EffectiveDate = model.EffectiveDate;
                    dest.Frequency = model.Frequency;
                    dest.EndDate = model.EndDate;
                    dest.Interval = model.Interval;
                    dest.AtTime = model.AtTime;
                    dest.EndDate = model.EndDate;
                    dest.Weekdays = model.Weekdays;
                    dest.MonthDays = model.MonthDays;
                    dest.ExceptionHours = model.ExceptionHours;
                    dest.ExceptionDates = model.ExceptionDates;
                    dest.ExceptionWeekdays = model.ExceptionWeekdays;
                }
            })
            .Map(dest => dest.Agents,
                src => src.TriggerFlowVersions != null
                    ? src.TriggerFlowVersions.Select(s => new AgentInfoDto
                    {
                        Id = s.FlowVersion.Id,
                        Name = s.FlowVersion.Flow.Name,
                        VersionNumber = s.FlowVersion.VersionNumber
                    }).ToList()
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null);

        // Mapping: TriggerFlowVersion → AssignAgentTriggerDto
        config.NewConfig<TriggerFlowVersion, AssignAgentTriggerDto>()
            .Map(dest => dest.Id,
                src => src.FlowVersion != null ? src.FlowVersion.Id : Guid.Empty)
            .Map(dest => dest.Name,
                src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : null)
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null)
            .Map(dest => dest.CreatedByUserInitials,
                src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName.First()}{src.CreatedByUser.LastName.First()}"
                    : null);

        // Mapping: TimeTriggerDto → Trigger entity
        // Used for creating/updating time-based triggers
        config.NewConfig<TimeTriggerDto, Trigger>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}