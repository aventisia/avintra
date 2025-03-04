namespace WorkspaceAPIs.MappingProfiles;

public class AgentTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<FlowVersion, AgentTableDto>()
            .Map(dest => dest.Name,
                src => src.Flow != null
                ? src.Flow.Name
                : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null)
            .Map(dest => dest.CreatedByUserInitials, src => src.CreatedByUser != null
                ? GetUserInitialsUtil.GetUserInitials(src.CreatedByUser.FirstName, src.CreatedByUser.LastName)
                : null);

        // Mapping to get agent list
        config.NewConfig<Machine, AssignMachineDto>()
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

        // New Mapping for Agents to SelectOptionDto (For dropdowns or select lists)
    }
}