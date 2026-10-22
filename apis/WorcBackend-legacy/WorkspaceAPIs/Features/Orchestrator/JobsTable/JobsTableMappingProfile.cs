namespace WorkspaceAPIs.MappingProfiles;

public class JobsTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // TODO: Remove the mapping for some properties once the properties names are in sync in Job entity

        // Mapping Job -> JobsTableRowDto
        config.NewConfig<Job, JobsTableRowDto>()
            .Map(dest => dest.FlowName, src => src.FlowVersion != null && src.FlowVersion.Flow != null ? src.FlowVersion.Flow.Name : "FLOW_NAME_NOT_FOUND")
            .Map(dest => dest.FlowVersionNumber, src => src.FlowVersion != null ? $"v{src.FlowVersion.VersionNumber}" : "VERSION_NUMBER_NOT_FOUND")
            .Map(dest => dest.IsFlowVersionPublished, src => src.FlowVersion != null ? src.FlowVersion.IsPublished : false)
            .Map(dest => dest.CreatedByName, src => src.ExecutedBy)
            .Map(dest => dest.CreatedAt, src => src.CreatedOn)
            .Map(dest => dest.ExecutionLocation, src => src.ExecutedOn)
            .Map(dest => dest.Remarks, src => src.Remark)
            .Map(dest => dest.StartTimeStamp, src => src.StartTime)
            .Map(dest => dest.EndTimeStamp, src => src.EndTime);

        // Mapping Job -> JobRecordDto
        config.NewConfig<Job, JobRecordDto>()
            .Map(dest => dest.FlowName, src => src.FlowVersion != null && src.FlowVersion.Flow != null ? src.FlowVersion.Flow.Name : "FLOW_NAME_NOT_FOUND")
            .Map(dest => dest.FlowVersionNumber, src => src.FlowVersion != null ? $"v{src.FlowVersion.VersionNumber}" : "VERSION_NUMBER_NOT_FOUND")
            .Map(dest => dest.FlowType, src => src.FlowVersion != null && src.FlowVersion.Flow != null ? src.FlowVersion.Flow.Type : FlowTypesEnum.Agent)
            .Map(dest => dest.IsFlowVersionPublished, src => src.FlowVersion != null ? src.FlowVersion.IsPublished : false)
            .Map(dest => dest.CreatedByName, src => src.ExecutedBy)
            .Map(dest => dest.CreatedById, src => src.TriggerType == TriggerTypesEnum.Flow ? Guid.Empty : src.RefId ?? Guid.Empty)
            .Map(dest => dest.CreatedAt, src => src.CreatedOn)
            .Map(dest => dest.ExecutionLocation, src => src.ExecutedOn)
            .Map(dest => dest.Remarks, src => src.Remark)
            .Map(dest => dest.StartTimeStamp, src => src.StartTime)
            .Map(dest => dest.EndTimeStamp, src => src.EndTime);
        // TODO: JobInputData, JobOutputData, LastNodeLog mapping will be handled in the service layer as they are stored as JSON strings in the database and need to be deserialized into JsonDocument objects.

        // Mapping JobInsertDto -> Job
        // NOTE: ExecutedBy, RefId, and ExecutedOn are set explicitly in the service layer for manual jobs.
        config.NewConfig<JobInsertDto, Job>()
            .Map(dest => dest.ExecutedOn, src => src.ExecutionLocation)
            .IgnoreNullValues(true);
        // TODO: JobInputData, FlowVersionHistoryId, RetryCount mapping will be handled in the service layer as it is stored as a JSON string in the database and needs to be serialized from JsonDocument.

        // Mapping JobUpdateDto -> Job
        config.NewConfig<JobUpdateDto, Job>()
            .Map(dest => dest.Remark, src => src.Remarks)
            .Map(dest => dest.Status, src => src.ClosingStatus)
            .IgnoreNullValues(true);
        // TODO: JobOutputData mapping will be handled in the service layer as it is stored as a JSON string in the database and needs to be serialized from JsonDocument.

        // TODO: Need to check this
        // config.NewConfig<Job, ExportJobResponseDto>()
        //     .Map(dest => dest.CreatedOn, src => src.CreatedOn.Date.ToString("dd/MM/yyyy"))
        //     .Map(dest => dest.Name, src => src.FlowVersion != null && src.FlowVersion.Flow != null ? src.FlowVersion.Flow.Name : string.Empty)
        //     .Map(dest => dest.MachineName, src => src.Machine != null ? src.Machine.Name : string.Empty);
    }
}