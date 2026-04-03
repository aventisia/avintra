namespace WorkspaceAPIs.MappingProfiles
{
     /// <summary>
     /// Mapping profile for Conversation and related DTOs using Mapster.
     /// </summary>
     public class ConversationMappingProfile : IRegister
     {
          public void Register(TypeAdapterConfig config)
          {
               // Map from Conversation entity to ConversationDto
               config.NewConfig<Conversation, ConversationDto>()
                    .Map(dest => dest.UserId, src => src.UserId)
                    .Map(dest => dest.FlowVersionId, src => src.FlowVersionId)
                    .Map(dest => dest.Title,
                         src => src.Messages != null
                         ? src.Messages
                              .OrderByDescending(m => m.CreatedOn)
                              .Select(s => s.Content)
                              .FirstOrDefault() ?? "Untitled Conversation"
                         : "Untitled Conversation")
                    .Map(dest => dest.Status, src => src.Status);

               // Map from ConversationDto to Conversation
               config.NewConfig<ConversationDto, Conversation>()
                   .Ignore(dest => dest.Id)
                   .Ignore(dest => dest.CreatedByUserId)
                   .Ignore(dest => dest.LastModifiedByUserId)
                   .Ignore(dest => dest.TenantId)
                   .IgnoreNullValues(true);
          }
     }
}