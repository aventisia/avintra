namespace WorkspaceAPIs.Repos;

public class TimeTriggerFlowRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<TimeTriggersFlowVersion, WorkspaceDbContext>(workspaceDbContext), ITimeTriggerFlowRepo;