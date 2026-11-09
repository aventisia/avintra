namespace WorkspaceAPIs.MappingProfiles;

public class ChatArtifactsMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<InsertChatArtifactDto, ChatArtifact>();
    }
}
