namespace WorkspaceAPIs.MappingProfiles;

public class QueueTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for queue record or records.
        config.NewConfig<Queue, QueuesTableDto>()
            .Map(dest => dest.TotalPendingItems,
                src => src.QueueTransactions != null
                    ? src.QueueTransactions.Where(q => q.Status == QueueTransactionStatusTypesEnum.Pending).Count()
                    : 0)

            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)

            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a queue record.
        config.NewConfig<QueuesTableDto, Queue>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        config.NewConfig<CreateOrUpdateQueuesTableDto, Queue>()
            .Ignore(dest => dest.Id)
            .IgnoreNullValues(true);

        // Mapping to get agent list
        config.NewConfig<FlowVersion, AssignAgentQueueDto>()
            .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null)
            .Map(dest => dest.CreatedByUserInitials,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName.First() + "" + src.CreatedByUser.LastName.First()
                    : null);
    }
}