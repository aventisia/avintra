namespace WorkspaceAPIs.MappingProfiles;

public class TimeTriggerMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get trigger list of trigger records
        config.NewConfig<TimeTrigger, TimeTriggerDto>()
            .Map(dest => dest.Agents,
                src => src.TimeTriggerFlowVersions != null
                    ? src.TimeTriggerFlowVersions.Select(s => new AgentInfoDto()
                    {
                        Id = s.FlowVersion.Id,
                        Name = s.FlowVersion.Flow.Name,
                        VersionNumber = s.FlowVersion.VersionNumber
                    }).ToList()
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping to get agent list
        config.NewConfig<FlowVersion, AssignAgentTriggerDto>()
            .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null)
            .Map(dest => dest.CreatedByUserInitials,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName.First() + "" + src.CreatedByUser.LastName.First()
                    : null);

        // Mapping for inserting or updating project record
        config.NewConfig<TimeTriggerDto, TimeTrigger>()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.CreatedOn)
                .Ignore(dest => dest.LastModifiedOn)
                .Ignore(dest => dest.TenantId)
                .IgnoreNullValues(true);


        // New Mapping for Trigger to SelectOptionDto(For dropdowns or select lists)
        config.NewConfig<TimeTrigger, SelectOptionDto>()
                .Map(dest => dest.Value, src => src.Id)
                .Map(dest => dest.Label, src => src.Name)
                .Map(dest => dest.Disabled, src => src.IsDisabled);
    }
}