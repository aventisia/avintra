namespace WorkspaceAPIs.MappingProfiles;

public class ConfigStoreMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for ConfigStore record or records.
        config.NewConfig<ConfigStore, ConfigStoreDto>()
            .Map(dest => dest.Value, src => src.Type == ConfigStoreTypesEnum.CREDENTIAL ? string.Empty : src.Value)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a job record.
        config.NewConfig<ConfigStoreDto, ConfigStore>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}