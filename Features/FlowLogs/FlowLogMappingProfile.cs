namespace WorkspaceAPIs.MappingProfiles;

public class FlowLogMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for inserting or updating a flow log record.
        config.NewConfig<FlowLogDto, FlowLog>()
        .Ignore(dest => dest.Id)
        .IgnoreNullValues(true);

        // Mapping for Get the record
        config.NewConfig<FlowLog,FlowLogDto>()
        .Map(dest => dest.flowName, src => src.Flow.Name)
        .Map(dest => dest.Version,src => src.Version )
        .Map(dest => dest.Duration,src => src.Duration );

        
    }
}










