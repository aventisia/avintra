namespace WorkspaceAPIs.Repos;

public class ChatArtifactRepo : RepositoryBase<ChatArtifact, WorkspaceDbContext>, IChatArtifactRepo
{
    public ChatArtifactRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}
