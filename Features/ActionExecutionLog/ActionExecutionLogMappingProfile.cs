namespace WorkspaceAPIs.MappingProfiles;

public class ActionExecutionLogMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of logs to show on the UI.
        config.NewConfig<ActionExecutionLog, ActionExecutionLogDto>();

        //Mapping entity to insert or update the record
        config.NewConfig<ActionExecutionLogDto, ActionExecutionLog>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.ExecutedOn)
            .IgnoreNullValues(true);

    }
}