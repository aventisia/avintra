namespace WorkspaceAPIs.MappingProfiles;

public class KeyStoreMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for KeyStore record or records.
        config.NewConfig<KeyStore, KeyStoreDto>()
            .Map(dest => dest.Value, src => src.Type == KeyStoreTypesEnum.CREDENTIAL ? string.Empty : src.Value)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a job record.
        config.NewConfig<KeyStoreDto, KeyStore>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}