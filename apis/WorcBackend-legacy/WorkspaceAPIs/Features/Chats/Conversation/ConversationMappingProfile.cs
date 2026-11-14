namespace WorkspaceAPIs.MappingProfiles
{
     /// <summary>
     /// Mapping profile for Conversation and related DTOs using Mapster.
     /// </summary>
     public class ConversationMappingProfile : IRegister
     {
          private const int TitleMaxLength = 120;

          public void Register(TypeAdapterConfig config)
          {
               config.NewConfig<Conversation, ConversationDto>()
                    .Map(dest => dest.UserId, src => src.UserId)
                    .Map(dest => dest.FlowVersionId, src => src.FlowVersionId)
                    .Map(dest => dest.Title, src => ConversationTitle(src))
                    .Map(dest => dest.Status, src => src.Status);

               config.NewConfig<ConversationDto, Conversation>()
                    .Ignore(dest => dest.Id)
                    .Ignore(dest => dest.CreatedByUserId)
                    .Ignore(dest => dest.CreatedOn)
                    .Ignore(dest => dest.LastModifiedByUserId)
                    .Ignore(dest => dest.LastModifiedOn)
                    .Ignore(dest => dest.TenantId)
                    .Ignore(dest => dest.Channel)
                    .IgnoreNullValues(true);
          }

          private static string ConversationTitle(Conversation conversation)
          {
               var content = conversation.Messages?
                    .OrderByDescending(message => message.CreatedOn)
                    .Select(message => message.Content)
                    .FirstOrDefault();

               if (string.IsNullOrWhiteSpace(content))
               {
                    return "Untitled Conversation";
               }

               var title = content.Trim();
               return title.Length <= TitleMaxLength
                    ? title
                    : string.Concat(title.AsSpan(0, TitleMaxLength).TrimEnd(), "...");
          }
     }
}
