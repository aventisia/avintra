namespace WorkspaceAPIs.MappingProfiles;

public class FlowVersionMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<FlowVersion, FlowVersionDto>()
        .Map(dest => dest.CreatedBy, 
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)
        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null);

        config.NewConfig<FlowVersionDto, FlowVersion>()
            .Ignore(dest => dest.Id)
            .IgnoreNullValues(true);

    }
}