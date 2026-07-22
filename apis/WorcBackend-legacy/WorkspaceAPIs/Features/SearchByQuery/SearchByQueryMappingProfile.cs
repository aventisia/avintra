namespace WorkspaceAPIs.MappingProfiles;

public class SearchByQueryMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for flow version search results
        config.NewConfig<FlowVersion, FlowVersionSearchResultDto>()
            .Map(dest => dest.FlowVersionId, src => src.Id)
            .Map(dest => dest.FlowName, src => src.Flow!.Name);

        // Mapping for machine search results
        config.NewConfig<Machine, MachineSearchResultDto>()
            .Map(dest => dest.MachineId, src => src.Id)
            .Map(dest => dest.MachineName, src => src.Name);
    }
}
