namespace WorkspaceAPIs.MappingProfiles;

/// <summary>
/// Configures object mappings for resource flow access.
/// </summary>
public class ResourceFlowAccessMappingProfile : IRegister
{
    /// <summary>
    /// Registers the mapping configurations.
    /// </summary>
    /// <param name="config">The Mapster configuration.</param>
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Flow, ResourceAssignedFlowDto>()
            .Map(dest => dest.VersionCount, FlowsTableHelpers.ActiveVersionCount)
            .Map(dest => dest.LastModifiedOn, FlowsTableHelpers.LatestModifiedOn);
    }
}
