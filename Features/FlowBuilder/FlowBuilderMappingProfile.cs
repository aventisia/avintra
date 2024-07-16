namespace WorkspaceAPIs.MappingProfiles;

public class FlowBuilderMappingProfile : Profile
{
    public FlowBuilderMappingProfile()
    {
        // To get flow details to load in Studio when user opens flow
        CreateMap<Flow, LoadFlowDto>();
    }
}