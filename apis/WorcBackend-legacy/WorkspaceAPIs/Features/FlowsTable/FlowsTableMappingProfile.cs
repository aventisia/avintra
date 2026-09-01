namespace WorkspaceAPIs.MappingProfiles;

public class FlowsTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for flow record or records.
        config.NewConfig<Flow, FlowsTableDto>()
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersions != null && src.FlowVersions.Any()
                    ? src.FlowVersions
                        .OrderByDescending(w => w.VersionNumber)
                        .First().VersionNumber
                    : 0)
            .Map(dest => dest.SupportedPlatform,
                src => src.FlowVersions != null && src.FlowVersions.Any()
                    ? src.FlowVersions
                        .OrderByDescending(w => w.CreatedOn)
                        .FirstOrDefault().SupportedPlatform
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a flow record.
        config.NewConfig<FlowsTableDto, Flow>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}