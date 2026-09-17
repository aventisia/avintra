namespace WorkspaceAPIs.MappingProfiles;

public class QueueWorkItemMappingProfile : IRegister
{
    private readonly IStringEncryptionService? _encryptionService;

    public QueueWorkItemMappingProfile() { }

    public QueueWorkItemMappingProfile(IStringEncryptionService encryptionService)
    {
        _encryptionService = encryptionService;
    }

    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<QueueTransaction, QueueWorkItemDto>()
            .Map(dest => dest.QueueName, src => src.Queue != null ? src.Queue.Name : null)
            .Map(dest => dest.WorkItemData,
                src => src.Queue != null && src.Queue.IsStoredEncrypted
                ? _encryptionService.DecryptString(src.PayloadData ?? string.Empty)
                : src.PayloadData);

        config.NewConfig<QueueWorkItemDto, QueueTransaction>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.SourceWorkItemId)
            .Ignore(dest => dest.RetryCount)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}
