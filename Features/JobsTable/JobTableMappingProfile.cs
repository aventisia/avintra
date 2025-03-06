namespace WorkspaceAPIs.MappingProfiles;

public class JobTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for job record or records.
        config.NewConfig<Job, JobTableDto>()
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersion != null
                    ? src.FlowVersion.VersionNumber
                    : 0)
            .Map(dest => dest.Name,
                src => src.FlowVersion != null
                    ? src.FlowVersion.Flow.Name
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a job record.
        config.NewConfig<JobTableDto, Job>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.RetryCount)
            .IgnoreNullValues(true);
    }
}