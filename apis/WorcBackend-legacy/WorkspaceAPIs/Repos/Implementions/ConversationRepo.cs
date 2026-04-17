namespace WorkspaceAPIs.Repos;

public class ConversationRepo : RepositoryBase<Conversation, WorkspaceDbContext>, IConversationRepo
{
    public ConversationRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}