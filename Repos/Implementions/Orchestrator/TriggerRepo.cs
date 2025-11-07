namespace WorkspaceAPIs.Repos;

public class TriggerRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<TimeTrigger, WorkspaceDbContext>(workspaceDbContext), ITriggerRepo;