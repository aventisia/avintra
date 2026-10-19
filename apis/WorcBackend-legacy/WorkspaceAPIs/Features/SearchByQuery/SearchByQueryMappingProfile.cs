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

        config.NewConfig<Flow, FlowSearchOptionDto>()
            .Map(dest => dest.Value, src => src.Id.ToString())
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.VersionCount, FlowsTableHelpers.ActiveVersionCount)
            .Map(dest => dest.LastModifiedOn, FlowsTableHelpers.LatestModifiedOn);

        config.NewConfig<Machine, SelectOption>()
            .Map(dest => dest.Value, src => src.Id.ToString())
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.Description, src => MachineStatusEnum.Offline.ToString());
    }
}
