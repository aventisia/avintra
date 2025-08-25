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
        .Map(dest => dest.CreatedBy,
            src => src.CreatedByUser != null
            ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
            : null)

        .Map(dest => dest.PayloadData,
            src => src.Queue != null && src.Queue.IsStoredEncrypted
            ? _encryptionService.DecryptString(src.PayloadData ?? string.Empty)
            : src.PayloadData)

        .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
            ? src.CreatedByUser.UserName
            : null);

        config.NewConfig<QueueTransactionDto, QueueTransaction>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

    }
}