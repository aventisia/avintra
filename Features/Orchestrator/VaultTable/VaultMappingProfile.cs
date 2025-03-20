namespace WorkspaceAPIs.MappingProfiles;

public class VaultMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for Vault record or records.
        config.NewConfig<Vault, VaultDto>()
            .Map(dest => dest.Username, src => src.IsEncrypted ? "username: " : src.Username)
            .Map(dest => dest.Password, src => src.IsEncrypted ? string.Empty : src.Password)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a job record.
        config.NewConfig<VaultDto, Vault>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}