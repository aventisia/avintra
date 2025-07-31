


namespace MLModelBuilderAPIs.MappingProfiles;

public class GenerativeModelMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<MLModel, GenerativeModelDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null);

        config.NewConfig<GenerativeModel, GenerativeModelSetupTaskDto>()
            .Map(dest => dest.Temperature, src => src.Temperature)
            .Map(dest => dest.LLM, src => src.LLM)
            .Map(dest => dest.SecretKey, src => src.SecretKey)
            .Map(dest => dest.ConfigurationType, src => src.ConfigurationType)
            .Map(dest => dest.SetupObject, src => JsonSerializer.Deserialize<GenerativeModelSetupDto>(
                src.SetupObject, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }));

        config.NewConfig<GenerativeModelSetupTaskDto, GenerativeModel>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Serialize(src.SetupObject,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn);
    }
}