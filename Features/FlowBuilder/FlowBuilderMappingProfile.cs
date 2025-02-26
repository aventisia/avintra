namespace WorkspaceAPIs.MappingProfiles;

public class FlowBuilderMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // To get flow details to load in Studio when user opens flow
        config.NewConfig<FlowVersion, LoadFlowDto>();

        // To Update flow's node, edges etc silently in the background
        config.NewConfig<FlowSilentUpdateDto, FlowVersion>();
    }
}