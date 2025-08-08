namespace AccountsAPIs.MappingProfiles;

public class AppIntegrationMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping for app integration record or records.
        config.NewConfig<AppIntegration, AppIntegrationDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);
        
        // Mapping for inserting or updating a app integration record.
        config.NewConfig<AppIntegrationDto, AppIntegration>()
                   .Ignore(dest => dest.Id)
                   .Ignore(dest => dest.CreatedOn)
                   .Ignore(dest => dest.LastModifiedOn)
                   .IgnoreNullValues(true);
    }
}