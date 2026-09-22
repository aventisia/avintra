namespace WorkspaceAPIs.MappingProfiles;

public class QueueTransactionMappingProfile : IRegister
{

    private readonly IStringEncryptionService? _encryptionService;

    public QueueTransactionMappingProfile() { }

    public QueueTransactionMappingProfile(IStringEncryptionService encryptionService)
    {
        _encryptionService = encryptionService;
    }
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of versions to show on the UI.
        config.NewConfig<QueueTransaction, QueueTransactionDto>()
        .Map(dest => dest.QueueName, src => src.Queue != null ? src.Queue.Name : null)
        .Map(dest => dest.PayloadData,
            src => src.Queue != null && src.Queue.IsStoredEncrypted
            ? _encryptionService.DecryptString(src.PayloadData ?? string.Empty)
            : src.PayloadData);

        config.NewConfig<QueueTransactionDto, QueueTransaction>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.RetryCount)
            .Ignore(dest => dest.RetryTime.HasValue)
            .IgnoreNullValues(true);

    }
}