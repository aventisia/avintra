namespace WorkspaceAPIs.MappingProfiles
{
    public class AssistChatTableMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Mapping of DTO to get list of versions to show on the UI.
            config.NewConfig<FlowVersion, AssistChatTableDto>()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.ConversationCount, src => 0)
                .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : null)
                .Map(dest => dest.Type, src => src.Flow != null
                    ? src.Flow.Type
                    : FlowTypesEnum.ChatAgent)
                .Map(dest => dest.CreatedBy, src => src.CreatedByUser != null
                    ? $"{src.CreatedByUser.FirstName} {src.CreatedByUser.LastName}"
                    : null)
                .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                    ? src.CreatedByUser.UserName
                    : null)
                .Map(dest => dest.LastModifiedBy, src => src.LastModifiedByUser != null
                    ? $"{src.LastModifiedByUser.FirstName} {src.LastModifiedByUser.LastName}"
                    : null);
        }
    }
}