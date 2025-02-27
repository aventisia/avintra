namespace WorkspaceAPIs.MappingProfiles;

public class FlowBuilderMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // To get flow details to load in Studio when user opens flow
        config.NewConfig<FlowVersion, LoadFlowDto>()
            .Map(dest => dest.Id, src => src.FlowId)
            .Map(dest => dest.VersionId, src => src.Id)
            .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : null);

        // To Update flow's node, edges etc silently in the background
        config.NewConfig<FlowSilentUpdateDto, FlowVersion>()
            .Map(dest => dest.Id, src => src.VersionId)
            .Map(dest => dest.FlowId, src => src.Id);
    }
}