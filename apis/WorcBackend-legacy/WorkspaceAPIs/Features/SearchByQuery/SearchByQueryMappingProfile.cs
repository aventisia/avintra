namespace WorkspaceAPIs.MappingProfiles;

public class SearchByQueryMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for flow version search results
        config.NewConfig<FlowVersion, FlowVersionSearchResultDto>()
            .Map(dest => dest.FlowVersionId, src => src.Id)
            .Map(dest => dest.FlowName, src => src.Flow!.Name);
    }
}
