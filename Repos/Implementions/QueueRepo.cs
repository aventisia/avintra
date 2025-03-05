namespace WorkspaceAPIs.Repos;

public class QueueRepo : RepositoryBase<Queue, WorkspaceDbContext>, IQueueRepo
{
    public QueueRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}