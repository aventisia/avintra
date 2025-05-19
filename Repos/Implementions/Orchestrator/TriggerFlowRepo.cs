namespace WorkspaceAPIs.Repos;

public class TriggerFlowRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<TriggersFlowVersion, WorkspaceDbContext>(workspaceDbContext), ITriggerFlowRepo;