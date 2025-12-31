namespace MLModelBuilderAPIs.MappingProfiles;

public class ConversationHistoryMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping from ConversationHistory entity to ConversationHistoryDto for UI display
        config.NewConfig<ConversationHistory, ConversationHistoryDto>()
            .Map(dest => dest.MLModelName, src => src.AIProject != null ? src.AIProject.Name : null)
            .Map(dest => dest.MLModelId, src => src.AIProjectId);

        // Mapping from ConversationHistoryDto to ConversationHistory entity for inserting/updating records
        config.NewConfig<ConversationHistoryDto, ConversationHistory>()
            .Map(dest => dest.AIProjectId, src => src.MLModelId)
            .Ignore(dest => dest.Id)
            .IgnoreNullValues(true);
    }
}
