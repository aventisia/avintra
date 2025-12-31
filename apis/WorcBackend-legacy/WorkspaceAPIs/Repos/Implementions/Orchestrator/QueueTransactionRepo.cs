namespace WorkspaceAPIs.Repos;

public class QueueTransactionRepo(WorkspaceDbContext workspaceDbContext) : RepositoryBase<QueueTransaction, WorkspaceDbContext>(workspaceDbContext), IQueueTransactionRepo;