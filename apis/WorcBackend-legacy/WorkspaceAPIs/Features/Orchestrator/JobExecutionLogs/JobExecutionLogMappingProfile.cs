namespace WorkspaceAPIs.MappingProfiles;

public class JobExecutionLogMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for job execution log (list view)
        config.NewConfig<Job, JobExecutionLogDto>()
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersion != null
                    ? src.FlowVersion.VersionNumber
                    : 0)
            .Map(dest => dest.Type,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Type
                    : FlowTypesEnum.Agent)
            .Map(dest => dest.FlowId,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Id
                    : Guid.Empty)
            .Map(dest => dest.Name,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Name
                    : null);

        // Mapping for job execution log (detail view)
        config.NewConfig<Job, JobExecutionLogDetailDto>()
            .Map(dest => dest.Name,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Name
                    : string.Empty)
            .Map(dest => dest.FlowId,
                src => src.FlowVersion != null
                    ? src.FlowVersion.FlowId
                    : Guid.Empty)
            .Map(dest => dest.InputOutputObject,
                src => src.FlowVersion != null
                    ? src.InputArgumentsJson
                    : null)
            .Map(dest => dest.ReactFlowObject,
                src => src.FlowVersion != null
                    ? src.FlowVersion.FlowVersionHistories
                        .OrderByDescending(o => o.CreatedOn)
                        .Select(h => h.ReactFlowObject)
                        .FirstOrDefault()
                    : null)
            .Map(dest => dest.FlowVariablesObject,
                src => src.FlowVersion != null
                    ? src.FlowVersion.FlowVersionHistories
                        .OrderByDescending(o => o.CreatedOn)
                        .Select(h => h.ReactFlowObject)
                        .FirstOrDefault()
                    : null)
            .Map(dest => dest.VersionNumber,
                src => src.FlowVersion != null
                    ? src.FlowVersion.VersionNumber
                    : 0)
            .Map(dest => dest.Type,
                src => src.FlowVersion != null && src.FlowVersion.Flow != null
                    ? src.FlowVersion.Flow.Type
                    : FlowTypesEnum.Agent);
    }
}