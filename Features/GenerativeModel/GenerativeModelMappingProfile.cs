


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

        config.NewConfig<GenerativeModel, GenerativeModelDefaultSetupDto>()
            .Map(dest => dest.Temperature, src => src.Temperature)
            .Map(dest => dest.LLM, src => src.LLM)
            .Map(dest => dest.SecretKey, src => src.SecretKey)
            .Map(dest => dest.ConfigurationType, src => src.ConfigurationType)
            .Map(dest => dest.SetupObject, src => DeserializeSetupObject(src.SetupObject, src.Name.ToString()));

        config.NewConfig<GenerativeModelDefaultSetupDto, GenerativeModel>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Serialize(src.SetupObject,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }))
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn);
    }

    public static object? DeserializeSetupObject(string? setupJson, string? modelName)
    {
        if (string.IsNullOrWhiteSpace(setupJson) || string.IsNullOrWhiteSpace(modelName))
            return null;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        return modelName switch
        {
            nameof(GenerativeModelTypesEnum.ThoughtLeadership) =>
                JsonSerializer.Deserialize<ThoughtLeadershipModelConfigDto>(setupJson, options),

            nameof(GenerativeModelTypesEnum.CompanyDeepDive) =>
                JsonSerializer.Deserialize<CompanyProfileGenerationConfigDto>(setupJson, options),

            nameof(GenerativeModelTypesEnum.DocumentDrafting) =>
                JsonSerializer.Deserialize<DocumentDraftingConfigDto>(setupJson, options),

            nameof(GenerativeModelTypesEnum.PersonaResearch) =>
                JsonSerializer.Deserialize<PersonaResearchConfigDto>(setupJson, options),

            nameof(GenerativeModelTypesEnum.RFPResponseGenerator) =>
                JsonSerializer.Deserialize<RFPResponseGenerationConfigDto>(setupJson, options),

            _ => null
        };
    }
}