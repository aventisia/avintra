namespace MLModelBuilderAPIs.MappingProfiles;

public class AIProjectVersionApiKeyMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extracted data to show on the UI.
        config.NewConfig<AIProjectVersionApiKey, AIProjectVersionApiKeyDto>()
            .Map(dest => dest.ApiKey, src => string.Empty)
            .Map(dest => dest.Type, src => src.AIProjectVersion != null ? src.AIProjectVersion.AIProject.Type.ToString() : null)
            .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null ? src.CreatedByUser.UserName : null);

        //Mapping entity to insert or update the record
        config.NewConfig<AIProjectVersionApiKeyDto, AIProjectVersionApiKey>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.ApiKey)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);
    }
}