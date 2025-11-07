namespace WorkspaceAPIs.Repos;

public class TriggerFlowRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<TimeTriggersFlowVersion, WorkspaceDbContext>(workspaceDbContext), ITriggerFlowRepo;