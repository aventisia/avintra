namespace WorkspaceAPIs.MappingProfiles;

public class QueueTransactionEventMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Maps a queue transaction event entity to its corresponding DTO
        // for API responses.
        config.NewConfig<QueueTransactionEvent, QueueTransactionEventDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                : null);

        // Maps a queue transaction event DTO to its corresponding entity
        // while preserving system-managed properties.
        config.NewConfig<QueueTransactionEventDto, QueueTransactionEvent>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}