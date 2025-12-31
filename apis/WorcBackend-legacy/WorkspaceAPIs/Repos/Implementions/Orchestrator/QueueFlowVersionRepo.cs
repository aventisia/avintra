namespace WorkspaceAPIs.Repos;

public class QueueFlowVersionRepo : RepositoryBase<QueueFlowVersion, WorkspaceDbContext>, IQueueFlowVersionRepo
{
    public QueueFlowVersionRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}