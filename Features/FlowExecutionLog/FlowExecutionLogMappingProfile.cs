namespace WorkspaceAPIs.MappingProfiles;

public class FlowExecutionLogMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of logs to show on the UI.
        config.NewConfig<FlowExecutionLog, FlowExecutionLogDto>();

        //Mapping entity to insert or update the record
        config.NewConfig<FlowExecutionLogDto, FlowExecutionLog>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.ExecutedOn)
            .IgnoreNullValues(true);

    }
}