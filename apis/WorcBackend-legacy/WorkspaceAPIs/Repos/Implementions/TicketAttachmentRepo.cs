namespace WorkspaceAPIs.Repos;

public class TicketAttachmentRepo : RepositoryBase<TicketAttachment, WorkspaceDbContext>, ITicketAttachmentRepo
{
    public TicketAttachmentRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}
