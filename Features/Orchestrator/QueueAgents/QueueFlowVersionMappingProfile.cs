namespace WorkspaceAPIs.MappingProfiles
{
    /// <summary>
    /// Defines the mapping configuration between the QueueFlowVersion entity and the QueueFlowVersionDto data transfer object using Mapster.
    /// </summary>
    public class QueueFlowVersionMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Map properties from QueueFlowVersion entity to QueueFlowVersionDto
            config.NewConfig<QueueFlowVersion, QueueFlowVersionDto>()
                .Map(dest => dest.FlowName,
                    src => src.FlowVersion != null
                        ? (src.FlowVersion.Flow != null ? src.FlowVersion.Flow.Name : string.Empty)
                        : string.Empty)
                    .Map(dest => dest.QueueName,
                    src => src.Queue != null
                        ? src.Queue.Name
                        : string.Empty)
                .Map(dest => dest.CreatedBy,
                     src => src.CreatedByUser != null
                         ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                         : null)
                .Map(dest => dest.LastModifiedBy,
                     src => src.LastModifiedByUser != null
                         ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                         : null);

            // Map properties from QueueFlowVersionDto to QueueFlowVersion when inserting or updating records
            config.NewConfig<QueueFlowVersionDto, QueueFlowVersion>()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.CreatedOn)
                .Ignore(dest => dest.LastModifiedOn)
                .Ignore(dest => dest.TenantId)
                .IgnoreNullValues(true);
        }
    }
}
