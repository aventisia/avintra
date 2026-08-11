namespace WorkspaceAPIs.MappingProfiles;

public class QueueTableMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for queue record or records.
        config.NewConfig<Queue, QueuesTableDto>()
            .Map(dest => dest.InProgress, src => src.QueueTransactions != null ? src.QueueTransactions.Count(c => c.Status == QueueTransactionStatusTypesEnum.InProgress.ToString()) : 0)
            .Map(dest => dest.Completed, src => src.QueueTransactions != null ? src.QueueTransactions.Count(c => c.Status == QueueTransactionStatusTypesEnum.Completed.ToString()) : 0)
            .Map(dest => dest.Failed, src => src.QueueTransactions != null ? src.QueueTransactions.Count(c => c.Status == QueueTransactionStatusTypesEnum.Failed.ToString()) : 0)
            .Map(dest => dest.Pending, src => src.QueueTransactions != null ? src.QueueTransactions.Count(c => c.Status == QueueTransactionStatusTypesEnum.Pending.ToString()) : 0)
            .Map(dest => dest.Total, src => src.QueueTransactions != null ? src.QueueTransactions.Count(c => c.Status == QueueTransactionStatusTypesEnum.Pending.ToString() || c.Status == QueueTransactionStatusTypesEnum.InProgress.ToString()) : 0)
            .Map(dest => dest.AverageAgeSeconds, src => src.QueueTransactions != null
                ? src.QueueTransactions
                    .Where(c => c.Status == QueueTransactionStatusTypesEnum.Pending.ToString() || c.Status == QueueTransactionStatusTypesEnum.InProgress.ToString())
                    .Select(c => (DateTimeOffset.UtcNow - c.CreatedOn).TotalSeconds)
                    .DefaultIfEmpty(0)
                    .Average()
                : 0)
            .Map(dest => dest.AverageProcessingTimeSeconds, src => src.QueueTransactions != null
                ? src.QueueTransactions
                    .Where(c => c.Status == QueueTransactionStatusTypesEnum.Completed.ToString())
                    .Select(c => (c.LastModifiedOn - c.CreatedOn).TotalSeconds)
                    .DefaultIfEmpty(0)
                    .Average()
                : 0)
            .Map(dest => dest.InputSchema, src => System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(src.InputSchema ?? "[]", new JsonSerializerOptions { PropertyNameCaseInsensitive = true }))
            .Map(dest => dest.Statuses, src => System.Text.Json.JsonSerializer.Deserialize<List<QueueStatusDefinitionDto>>(src.Statuses ?? "[]", new JsonSerializerOptions { PropertyNameCaseInsensitive = true }))
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName : null);

        // Mapping for inserting or updating a queue record.
        config.NewConfig<QueuesTableDto, Queue>()
            .Map(dest => dest.InputSchema, src => System.Text.Json.JsonSerializer.Serialize(src.InputSchema, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }))
            .Map(dest => dest.Statuses, src => System.Text.Json.JsonSerializer.Serialize(src.Statuses, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
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

        // Mapping to get user list
        config.NewConfig<WorkspaceUser, AssignUserQueueDto>()
            .Map(dest => dest.Name, src => src.FirstName + " " + src.LastName);
    }
}