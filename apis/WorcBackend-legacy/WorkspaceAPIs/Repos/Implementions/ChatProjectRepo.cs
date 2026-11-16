namespace WorkspaceAPIs.Repos;

public class ChatProjectRepo : RepositoryBase<ChatProject, WorkspaceDbContext>, IChatProjectRepo
{
    public ChatProjectRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}
