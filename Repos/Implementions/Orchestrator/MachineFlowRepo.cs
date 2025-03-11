namespace WorkspaceAPIs.Repos;

public class MachineFlowRepo : RepositoryBase<MachineFlow, WorkspaceDbContext>, IMachineFlowRepo
{
    public MachineFlowRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}