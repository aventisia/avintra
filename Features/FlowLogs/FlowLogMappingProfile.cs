namespace WorkspaceAPIs.MappingProfiles;

public class FlowLogMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating a flow log record.
        config.NewConfig<FlowLogDto, FlowLog>();
    }
}