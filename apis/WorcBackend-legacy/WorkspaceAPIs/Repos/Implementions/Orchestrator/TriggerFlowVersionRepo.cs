namespace WorkspaceAPIs.Repos;

public class TriggerFlowVersionRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<TriggerFlowVersion, WorkspaceDbContext>(workspaceDbContext), ITriggerFlowVersionRepo;