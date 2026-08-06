namespace WorkspaceAPIs.Repos;

public class TicketHistoryRepo : RepositoryBase<TicketHistory, WorkspaceDbContext>, ITicketHistoryRepo
{
    public TicketHistoryRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
