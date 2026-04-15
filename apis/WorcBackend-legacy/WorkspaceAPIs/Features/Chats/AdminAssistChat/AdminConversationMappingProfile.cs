namespace WorkspaceAPIs.MappingProfiles
{
    public class AdminConversationMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Mapping: Conversation → AdminConversationDto
            // Purpose: Provide summarized conversation data for admin listing views
            config.NewConfig<Conversation, AdminConversationDto>()

                // Derive a short title from the latest message (first 5 words) Falls back to "Untitled Conversation" if no content exists
                .Map(dest => dest.Title, src =>
                    src.Messages
                        .OrderByDescending(m => m.CreatedOn)
                        .Select(m =>
                            string.Join(" ",
                                (m.Content ?? "Untitled Conversation")
                                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                    .Take(5)
                            )
                        )
                        .FirstOrDefault() ?? "Untitled Conversation")

                // Count only non-user messages (e.g., system/assistant responses)
                .Map(dest => dest.TotalExchange, src =>
                    src.Messages.Count(m => m.Role != ConversationMessageSenderEnum.User)
                )

                // Use the most recent message timestamp, or fallback to conversation creation time
                .Map(dest => dest.Timestamp, src =>
                    src.Messages
                        .OrderByDescending(m => m.CreatedOn)
                        .Select(m => (DateTimeOffset?)m.CreatedOn)
                        .FirstOrDefault() ?? src.CreatedOn
                )

                // Basic user information (safely handles null User)
                .Map(dest => dest.FirstName, src => src.User != null ? src.User.FirstName : string.Empty)
                .Map(dest => dest.LastName, src => src.User != null ? src.User.LastName : string.Empty)
                .Map(dest => dest.Username, src => src.User != null ? src.User.UserName : string.Empty)

                // Flow/version metadata (null-safe navigation)
                .Map(dest => dest.VersionNumber, src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
                .Map(dest => dest.FlowName, src =>
                    src.FlowVersion != null && src.FlowVersion.Flow != null
                        ? src.FlowVersion.Flow.Name
                        : null);

            // Mapping: Conversation → AdminConversationMessageDto
            // Purpose: Provide detailed conversation view including full message history
            config.NewConfig<Conversation, AdminConversationMessageDto>()

                // Same title logic as summary view (latest message preview)
                .Map(dest => dest.Title, src =>
                    src.Messages
                        .OrderByDescending(m => m.CreatedOn)
                        .Select(m =>
                            string.Join(" ",
                                (m.Content ?? "Untitled Conversation")
                                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                    .Take(5)
                            )
                        )
                        .FirstOrDefault() ?? "Untitled Conversation"
                )

                // Count of assistant/system responses
                .Map(dest => dest.TotalExchange, src =>
                    src.Messages.Count(m => m.Role != ConversationMessageSenderEnum.User)
                )

                // Latest activity timestamp
                .Map(dest => dest.Timestamp, src =>
                    src.Messages
                        .OrderByDescending(m => m.CreatedOn)
                        .Select(m => (DateTimeOffset?)m.CreatedOn)
                        .FirstOrDefault() ?? src.CreatedOn
                )

                // User information (null-safe)
                .Map(dest => dest.FirstName, src => src.User != null ? src.User.FirstName : string.Empty)
                .Map(dest => dest.LastName, src => src.User != null ? src.User.LastName : string.Empty)
                .Map(dest => dest.Username, src => src.User != null ? src.User.UserName : string.Empty)

                // Flow/version metadata
                .Map(dest => dest.VersionNumber, src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
                .Map(dest => dest.FlowName, src =>
                    src.FlowVersion != null && src.FlowVersion.Flow != null
                        ? src.FlowVersion.Flow.Name
                        : null)

                // Map and order messages chronologically (oldest → newest)
                .Map(dest => dest.Messages, src =>
                    src.Messages
                        .OrderByDescending(m => m.CreatedOn)
                        .Select(m => new ConversationMessageDto
                        {
                            Id = m.Id,
                            Role = m.Role,
                            Content = m.Content,
                            CreatedOn = m.CreatedOn,
                            ConversationId = src.Id,
                            FlowVersionId = src.FlowVersionId,
                        })
                        .OrderBy(m => m.CreatedOn)
                );
        }
    }
}