namespace WorkspaceAPIs.MappingProfiles;

public class FlowBuilderMappingProfile : Profile
{
    public FlowBuilderMappingProfile()
    {
        // To get flow details to load in Studio when user opens flow
        CreateMap<Flow, LoadFlowDto>();

        // To Update flow's node, edges etc silently in the background
        CreateMap<FlowSilentUpdateDto, Flow>();
    }
}