namespace WorkspaceAPIs.MappingProfiles
{
    public class AdminConversationMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Configures mapping from Conversation entity to AdminConversationDto
            // Used for displaying conversation data in the admin UI.
            config.NewConfig<Conversation, AdminConversationDto>()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Status, src => src.Status)

                // Generate title from the most recent message content
                .Map(dest => dest.Title, src =>
                    src.Messages
                        .OrderByDescending(m => m.CreatedOn)
                        .Select(s => string.Join(" ",
                            (s.Content ?? "Untitled Conversation")
                                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                .Take(5)))
                        .FirstOrDefault() ?? "Untitled Conversation")

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
                // Set timestamp as latest message CreatedOn, fallback to conversation CreatedOn
                .Map(dest => dest.Timestamp, src =>
                    src.Messages
                        .OrderByDescending(o => o.CreatedOn)
                        .Select(s => (DateTimeOffset?)s.CreatedOn)
                        .FirstOrDefault() ?? src.CreatedOn)

                // User details
                .Map(dest => dest.UserId, src => src.UserId)
                .Map(dest => dest.FirstName, src => src.User != null ? src.User.FirstName : string.Empty)
                .Map(dest => dest.LastName, src => src.User != null ? src.User.LastName : string.Empty)

                // Flow details
                .Map(dest => dest.FlowVersionId, src => src.FlowVersionId)
                .Map(dest => dest.VersionNumber, src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
                .Map(dest => dest.FlowName, src =>
                    src.FlowVersion != null && src.FlowVersion.Flow != null
                        ? src.FlowVersion.Flow.Name
                        : null)

                // Last modified details
                .Map(dest => dest.LastModifiedByUsername, src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.UserName
                    : null)
                .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null);
        }
    }
}