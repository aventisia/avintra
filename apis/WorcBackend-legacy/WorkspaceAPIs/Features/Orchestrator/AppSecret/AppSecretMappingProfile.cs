namespace WorkspaceAPIs.MappingProfiles;

public class AppSecretMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for app secret record or records.
        config.NewConfig<AppSecret, AppSecretDto>()
            .Map(dest => dest.Data, src => System.Text.Json.JsonSerializer.Deserialize<object>(src.Data, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }))
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping for inserting or updating a app secret record.
        config.NewConfig<AppSecretDto, AppSecret>()
            .Ignore(dest => dest.Data)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

        // Get app secret in SelectOption format
        // The option Value is the resource NAME (not the ID) so the Agent Builder
        // stores and resolves credentials by name.
        config.NewConfig<AppSecret, SelectOption>()
            .Map(dest => dest.Value, src => src.Name)
            .Map(dest => dest.Label, src => src.Name)
            .Map(dest => dest.Description, src => src.Description);
    }
}