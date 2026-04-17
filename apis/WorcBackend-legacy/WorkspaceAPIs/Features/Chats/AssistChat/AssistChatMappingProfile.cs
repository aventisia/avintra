namespace WorkspaceAPIs.MappingProfiles
{
    public class AssistChatMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Mapping of DTO to get list of versions to show on the UI.
            config.NewConfig<FlowVersion, AssistChatDto>()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Conversations,
                    src => src.Conversations != null
                        ? src.Conversations.Select(s => new ConversationSummaryDto
                        {
                            Id = s.Id,
                            Title = (s.Messages ?? Enumerable.Empty<ConversationMessage>())
                                .OrderByDescending(m => m.CreatedOn)
                                .Select(s1 => string.Join(" ",
                                    (s1.Content ?? "Untitled Conversation")
                                        .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                        .Take(5)))
                                .FirstOrDefault() ?? "Untitled Conversation",

                            Timestamp = (s.Messages != null && s.Messages.Any())
                            ? s.Messages
                                .OrderByDescending(o => o.CreatedOn)
                                .Select(s1 => s1.CreatedOn)
                                .FirstOrDefault()
                            : s.CreatedOn,

                            Status = s.Status
                        })
                        : null)
                .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : null)
                .Map(dest => dest.Description, src => src.Flow != null ? src.Flow.Description : null)
                .Map(dest => dest.LastModifiedByUsername, src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.UserName
                    : null)
                .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null);
        }
    }
}