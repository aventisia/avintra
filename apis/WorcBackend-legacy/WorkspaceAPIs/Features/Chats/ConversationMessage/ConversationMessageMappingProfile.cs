namespace WorkspaceAPIs.MappingProfiles
{
    /// <summary>
    /// Mapping profile for ConversationMessage and related DTOs using Mapster.
    /// </summary>
    public class ConversationMessageMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Map from ConversationMessage entity to ConversationMessageDto
            config.NewConfig<ConversationMessage, ConversationMessageDto>()
                .Map(dest => dest.ConversationId, src => src.ConversationId)
                .Map(dest => dest.Content, src => src.Content)
                .Map(dest => dest.Role, src => src.Role)
                .Map(dest => dest.Metadata, src => src.Metadata)
                .Map(dest => dest.CreatedOn, src => src.CreatedOn);

            // Map from ConversationMessageDto to ConversationMessage
            config.NewConfig<ConversationMessageDto, ConversationMessage>()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.TenantId)
                .IgnoreNullValues(true);

            // Map from ConversationMessage entity to SearchConversationMessageDto
            config.NewConfig<ConversationMessage, SearchConversationMessageDto>()
                .Map(dest => dest.ConversationId, src => src.ConversationId)
                .Map(dest => dest.Content, src => src.Content)
                .Map(dest => dest.FlowVersionId, src =>
                    src.Conversation != null ? src.Conversation.FlowVersionId : Guid.Empty)
                .Map(dest => dest.VersionNumber, src =>
                    src.Conversation != null && src.Conversation.FlowVersion != null
                        ? src.Conversation.FlowVersion.VersionNumber
                        : 0)
                .Map(dest => dest.IsArchived, src =>
                    src.Conversation != null && src.Conversation.FlowVersion != null
                        ? src.Conversation.FlowVersion.IsArchived
                        : false)
                .Map(dest => dest.Name, src =>
                    src.Conversation != null
                    && src.Conversation.FlowVersion != null
                    && src.Conversation.FlowVersion.Flow != null
                        ? src.Conversation.FlowVersion.Flow.Name
                        : string.Empty)
                .Map(dest => dest.Description, src =>
                    src.Conversation != null
                    && src.Conversation.FlowVersion != null
                    && src.Conversation.FlowVersion.Flow != null
                        ? src.Conversation.FlowVersion.Flow.Description
                        : string.Empty)
                .Map(dest => dest.CreatedOn, src => src.CreatedOn);
        }
    }
}