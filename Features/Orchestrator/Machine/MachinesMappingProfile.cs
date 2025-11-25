namespace WorkspaceAPIs.MappingProfiles;

public class MachinesMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get machine list of machine records
        config.NewConfig<Machine, MachineDto>()
            .Map(dest => dest.AgentCount, src => src.MachineFlows != null ? src.MachineFlows.Count : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null)
            .Map(dest => dest.CurrentTask,
                src =>
                    src.MachineFlows.Count != 0
                        ? src.MachineFlows
                            .OrderByDescending(o => o.CreatedOn)
                            .First().FlowVersion.Flow.Name
                        : null);

        // Mapping to get agent list
        config.NewConfig<MachineFlow, AssignAgentDto>()
            .Map(dest => dest.Id, src => src.FlowVersionId)
            .Map(dest => dest.Name, src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : null)
            .Map(dest => dest.MachineId, src => src.MachineId)
            .Map(dest => dest.IsAssigned, src => true)
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName : null)
            .Map(dest => dest.CreatedByUserInitials, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName.First() + "" + src.CreatedByUser.LastName.First() : null);

        // Mapping for inserting or updating project record
        config.NewConfig<MachineDto, Machine>()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.CreatedOn)
                .Ignore(dest => dest.LastModifiedOn)
                .Ignore(dest => dest.TenantId)
                .IgnoreNullValues(true);


        // New Mapping for Machine to SelectOptionDto(For dropdowns or select lists)
        config.NewConfig<Machine, SelectOptionDto>()
                .Map(dest => dest.Value, src => src.Id)
                .Map(dest => dest.Label, src => src.Name)
                .Map(dest => dest.Description, src => src.Hostname)
                .Map(dest => dest.Disabled, src => src.IsDisabled);
    }
}