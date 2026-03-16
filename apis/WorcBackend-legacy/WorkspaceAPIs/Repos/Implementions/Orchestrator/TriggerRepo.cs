namespace WorkspaceAPIs.Repos;

public class TriggerRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<Trigger, WorkspaceDbContext>(workspaceDbContext), ITriggerRepo;