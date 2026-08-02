namespace WorkspaceAPIs.MappingProfiles;

public class ApiKeyMappingProfile : IRegister
{
#pragma warning disable CS8603
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<ApiKey, ApiKeyDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        config.NewConfig<CreateApiKeyReqDto, ApiKey>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.KeyHash)
            .Ignore(dest => dest.KeyPrefix)
            .Ignore(dest => dest.LastUsedAt)
            .Ignore(dest => dest.IsRevoked)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.CreatedByUser)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.LastModifiedByUser)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.Version)
            .IgnoreNullValues(true);

        config.NewConfig<UpdateApiKeyDto, ApiKey>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.KeyHash)
            .Ignore(dest => dest.KeyPrefix)
            .Ignore(dest => dest.LastUsedAt)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.CreatedByUser)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.LastModifiedByUser)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.Version)
            .IgnoreNullValues(true);
    }
#pragma warning restore CS8603
}
