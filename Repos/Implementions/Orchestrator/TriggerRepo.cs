namespace WorkspaceAPIs.Repos;

public class TriggerRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<Triggers, WorkspaceDbContext>(workspaceDbContext), ITriggerRepo;