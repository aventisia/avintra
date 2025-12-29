namespace WorkspaceAPIs.MappingProfiles;

public class JobTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for job record or records.
        config.NewConfig<Job, JobTableDto>()
            .Map(dest => dest.Name, src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : null);

        // Mapping for job record or records.
        config.NewConfig<Job, JobExecutionLogDto>()
            .Map(dest => dest.Name, src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : null);

        config.NewConfig<Job, JobDetailDto>()
            .Map(dest => dest.FlowId, src => src.FlowVersion != null ? src.FlowVersion.FlowId : Guid.Empty)
            .Map(dest => dest.Name, src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : null)
            .Map(dest => dest.InputOutputObject, src => src.FlowVersion != null ? src.FlowVersion.InputOutputObject : null)
            .Map(dest => dest.ReactFlowObject, src => src.FlowVersion != null ? src.FlowVersion.ReactFlowObject : null)
            .Map(dest => dest.FlowVariablesObject, src => src.FlowVersion != null ? src.FlowVersion.FlowVariablesObject : null)
            .Map(dest => dest.VersionNumber, src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
            .Map(dest => dest.Type, src => src.FlowVersion != null ? src.FlowVersion.Flow.Type : FlowTypesEnum.Agent);

        // Mapping for inserting or updating a job record.
        config.NewConfig<JobTableDto, Job>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.RetryCount)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.CreatedOn)
            .IgnoreNullValues(true);

        config.NewConfig<JobExecutionDto, Job>()
           .Ignore(dest => dest.Id)
           .Ignore(dest => dest.RetryCount)
           .Ignore(dest => dest.TenantId)
           .Ignore(dest => dest.CreatedOn)
           .IgnoreNullValues(true);
    }
}