namespace WorkspaceAPIs.MappingProfiles;

public class ChatArtifactsMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<InsertChatArtifactDto, ChatArtifact>();
        config.NewConfig<ChatArtifact, ChatArtifactDto>()
            .Map(dest => dest.IsShared, src => src.ShareToken != null);
    }
}
