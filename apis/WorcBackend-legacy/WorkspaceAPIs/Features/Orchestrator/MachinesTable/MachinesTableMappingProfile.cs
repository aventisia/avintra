namespace WorkspaceAPIs.MappingProfiles;

public class MachinesTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // For - Retrieves list of machines or Retrieve machine by its ID
        config.NewConfig<Machine, MachinesTableRowDto>()
            .Map(dest => dest.FlowVersionCount, src => src.MachineFlowVersions != null ? src.MachineFlowVersions.Count : 0)
            .Map(dest => dest.LinkedUserAccount,
                src => src.User != null ? src.User.UserName : null);

        // For - Retrieves machine by its ID
        config.NewConfig<Machine, MachineRecordDto>()
            .Map(dest => dest.MachineFlowVersions, src => src.MachineFlowVersions)
            .Map(dest => dest.LinkedUserAccount,
                src => src.User != null ? src.User.UserName : null);

        // For - Extension_Retrieves machine by its ID (assigned flow versions)
        config.NewConfig<Machine_FlowVersion, MachineFlowVersion>()
            .Map(dest => dest.Value, src => src.FlowVersionId.ToString())
            .Map(dest => dest.Label,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? $"{src.FlowVersion.Flow.Name}_v{src.FlowVersion.VersionNumber}"
                    : string.Empty)
            .Map(dest => dest.Description,
                src => src.FlowVersion != null && src.FlowVersion.IsPublished ? "Published" : "Draft")
            .Map(dest => dest.FlowId,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? (Guid?)src.FlowVersion.FlowId
                    : null)
            .Map(dest => dest.FlowName,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Name
                    : null)
            .Map(dest => dest.FlowType,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? (FlowTypesEnum?)src.FlowVersion.Flow.Type
                    : null)
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
            .Map(dest => dest.SupportedPlatform,
                src => src.FlowVersion != null ? src.FlowVersion.SupportedPlatform : null)
            .Map(dest => dest.LastModifiedOn,
                src => src.FlowVersion != null ? (DateTimeOffset?)src.FlowVersion.LastModifiedOn : null);

        // For - Update existing machine
        config.NewConfig<UpdateMachineDto, Machine>()
            .Ignore(dest => dest.Name)
            .Ignore(dest => dest.CreatedAt)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);

    }
}
