namespace WorkspaceAPIs.Repos;

public class AITaskRepo : RepositoryBase<AITask, WorkspaceDbContext>, IAITaskRepo
{
    public AITaskRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {
        
    }
}