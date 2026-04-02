namespace WorkspaceAPIs.Repos;

public class ConversationMessageRepo : RepositoryBase<ConversationMessage, WorkspaceDbContext>, IConversationMessageRepo
{
    public ConversationMessageRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}