namespace WorkspaceAPIs.MappingProfiles;

public class VaultCredentialMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<VaultCredential, VaultCredentialDto>()
            .Map(dest => dest.Data, src => System.Text.Json.JsonSerializer.Deserialize<object>(src.Data, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }))
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        config.NewConfig<VaultCredentialDto, VaultCredential>()
            .Ignore(dest => dest.Data)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        config.NewConfig<VaultCredential, SelectOption>()
            .Map(dest => dest.Value, src => src.Name)
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.Description, src => src.Description);
    }
}