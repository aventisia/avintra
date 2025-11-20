namespace WorkspaceAPIs.MappingProfiles;

public class JobTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for job record or records.
        config.NewConfig<Job, JobTableDto>()
            .Map(dest => dest.Name, src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : null);

        // Mapping for inserting or updating a job record.
        config.NewConfig<JobTableDto, Job>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.RetryCount)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);
    }
}