namespace WorkspaceAPIs.Repos;

public class TicketCommentRepo : RepositoryBase<TicketComment, WorkspaceDbContext>, ITicketCommentRepo
{
    public TicketCommentRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
