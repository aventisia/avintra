namespace WorkspaceAPIs.Repos;

public class TimeTriggerRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<TimeTrigger, WorkspaceDbContext>(workspaceDbContext), ITimeTriggerRepo;