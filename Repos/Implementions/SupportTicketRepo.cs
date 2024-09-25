namespace WorkspaceAPIs.Repos;

public class SupportTicketRepo : RepositoryBase<SupportTicket, WorkspaceDbContext>, ISupportTicketRepo
{
    public SupportTicketRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}