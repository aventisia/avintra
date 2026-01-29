namespace WorkspaceAPIs.Repos;

public class QueueUserRepo : RepositoryBase<QueueUser, WorkspaceDbContext>, IQueueUserRepo
{
    public QueueUserRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}