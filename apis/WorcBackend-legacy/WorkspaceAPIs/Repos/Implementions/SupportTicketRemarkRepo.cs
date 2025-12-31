namespace WorkspaceAPIs.Repos;

public class SupportTicketRemarkRepo : RepositoryBase<SupportTicketRemark, WorkspaceDbContext>, ISupportTicketRemarkRepo
{
    public SupportTicketRemarkRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }

}