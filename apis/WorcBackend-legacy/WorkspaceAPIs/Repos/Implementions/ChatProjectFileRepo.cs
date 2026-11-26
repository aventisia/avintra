namespace WorkspaceAPIs.Repos;

public class ChatProjectFileRepo : RepositoryBase<ChatProjectFile, WorkspaceDbContext>, IChatProjectFileRepo
{
    public ChatProjectFileRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}
