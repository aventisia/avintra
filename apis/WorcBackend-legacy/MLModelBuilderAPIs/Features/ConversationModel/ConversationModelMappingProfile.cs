


namespace MLModelBuilderAPIs.MappingProfiles;

public class ConversationModelMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AIProject, ConversationModelDto>()
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null);

        config.NewConfig<VersionTask, ConversationModelSetupTaskDto>()
            .Map(dest => dest.Temperature, src => src.Temperature)
            .Map(dest => dest.LLM, src => src.LLM)
            .Map(dest => dest.NodePrompt, src => src.SystemPrompt)
            .Map(dest => dest.SecretKey, src => src.CloudLLMCredentialId)
            .Map(dest => dest.ConfigurationType, src => src.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem)
            .Map(dest => dest.SetupObject, src => JsonSerializer.Deserialize<ConversationModelSetupDto>(
                src.SetupObject, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }));

        config.NewConfig<ConversationModelSetupTaskDto, VersionTask>()
            .Map(dest => dest.SetupObject, src => JsonSerializer.Serialize(src.SetupObject,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }))
            .Map(dest => dest.IsBYOKEnabled, src => src.ConfigurationType == LLMConfigurationTypesEnum.Cloud)
            .Map(dest => dest.CloudLLMCredentialId, src => src.SecretKey)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn);
    }
}