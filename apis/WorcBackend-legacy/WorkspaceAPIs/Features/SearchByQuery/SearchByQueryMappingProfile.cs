namespace WorkspaceAPIs.MappingProfiles;

public class SearchByQueryMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<FlowVersion, FlowVersionSelectOption>()
            .Map(dest => dest.Value, src => src.Id.ToString())
            .Map(dest => dest.Label, src => $"{src.Flow!.Name}_v{src.VersionNumber}")
            .Map(dest => dest.Description, src => src.IsPublished ? "Published" : "Draft")
            .Map(dest => dest.SupportedPlatform, src => src.SupportedPlatform);

        config.NewConfig<Machine, SelectOption>()
            .Map(dest => dest.Value, src => src.Id.ToString())
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.Description, src => MachineStatusEnum.Offline.ToString());
    }
}
