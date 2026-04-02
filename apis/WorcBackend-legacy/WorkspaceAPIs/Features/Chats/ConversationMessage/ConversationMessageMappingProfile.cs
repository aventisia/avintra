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
          }
     }
}