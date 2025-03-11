namespace WorkspaceAPIs.Repos;

public class QueueTransactionRepo : RepositoryBase<QueueTransaction, WorkspaceDbContext>, IQueueTransactionRepo
{
    public QueueTransactionRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
    }
}