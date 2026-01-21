namespace WorkspaceAPIs.Repos;

public class OnPremModelRepo : RepositoryBase<OnPremModel, WorkspaceDbContext>, IOnPremModelRepo
{
    public OnPremModelRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}