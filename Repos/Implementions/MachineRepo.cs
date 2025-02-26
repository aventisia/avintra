namespace WorkspaceAPIs.Repos;

public class MachineRepo : RepositoryBase<Machine, WorkspaceDbContext>, IMachineRepo
{
    public MachineRepo(WorkspaceDbContext workspaceDbContext) : base(workspaceDbContext)
    {

    }
}