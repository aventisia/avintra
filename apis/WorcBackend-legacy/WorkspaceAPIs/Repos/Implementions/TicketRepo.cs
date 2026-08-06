namespace WorkspaceAPIs.Repos;

public class TicketRepo : RepositoryBase<Ticket, WorkspaceDbContext>, ITicketRepo
{
    public TicketRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
