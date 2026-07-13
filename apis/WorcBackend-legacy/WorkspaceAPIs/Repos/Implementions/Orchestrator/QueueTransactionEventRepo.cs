namespace WorkspaceAPIs.Repos;

public class QueueTransactionEventRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<QueueTransactionEvent, WorkspaceDbContext>(workspaceDbContext), IQueueTransactionEventRepo;