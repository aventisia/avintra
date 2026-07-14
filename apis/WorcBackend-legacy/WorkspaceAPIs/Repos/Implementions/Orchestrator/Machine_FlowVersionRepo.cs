namespace WorkspaceAPIs.Repos;

public class Machine_FlowVersionRepo : RepositoryBase<Machine_FlowVersion, WorkspaceDbContext>, IMachine_FlowVersionRepo
{
    public Machine_FlowVersionRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}