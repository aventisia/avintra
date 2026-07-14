namespace WorkspaceAPIs.MappingProfiles;

public class MachineFlowMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping to get machine flow records
        config.NewConfig<Machine_FlowVersion, MachineFlowDto>()
            .Map(dest => dest.Id, src => src.FlowVersionId)
            .Map(dest => dest.Name,
                src => src.FlowVersion != null
                    ? src.FlowVersion.Flow.Name
                    : null)
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersion != null
                    ? src.FlowVersion.VersionNumber
                    : 0)
            .Map(dest => dest.CreatedBy, src => (string?)null)
            .Map(dest => dest.LastModifiedBy, src => (string?)null)
            .Map(dest => dest.CreatedByUserInitials, src => (string?)null)
            .Map(dest => dest.CreatedOn, src => (DateTimeOffset?)null)
            .Map(dest => dest.LastModifiedOn, src => (DateTimeOffset?)null);

        // Mapping for inserting or updating machine flow record
        config.NewConfig<MachineFlowDto, Machine_FlowVersion>()
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}