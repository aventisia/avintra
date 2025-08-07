namespace MLModelBuilderAPIs.MappingProfiles;

public class ConversationHistoryMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping from ConversationHistory entity to ConversationHistoryDto for UI display
        config.NewConfig<ConversationHistory, ConversationHistoryDto>()
            .Map(dest => dest.MLModelName, src => src.MLModel != null ? src.MLModel.Name : null)
            .Map(dest => dest.MLModelId, src => src.MLModelId);

        // Mapping from ConversationHistoryDto to ConversationHistory entity for inserting/updating records
        config.NewConfig<ConversationHistoryDto, ConversationHistory>()
            .Ignore(dest => dest.Id)
            .IgnoreNullValues(true);
    }
}
