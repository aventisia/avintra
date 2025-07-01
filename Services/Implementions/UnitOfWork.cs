namespace WorkspaceAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly WorkspaceDbContext _workspaceDbContext;
    public UnitOfWork(
        WorkspaceDbContext workspaceDbContext)
    {
        _workspaceDbContext = workspaceDbContext;
    }

    public IWorkspaceUserRepo WorkspaceUserRepo => new WorkspaceUserRepo(_workspaceDbContext);

    public INotificationRepo NotificationRepo => new NotificationRepo(_workspaceDbContext);

    public INotificationUserRepo NotificationUserRepo => new NotificationUserRepo(_workspaceDbContext);

    public IFlowRepo FlowRepo => new FlowRepo(_workspaceDbContext);

    public IFlowCommentRepo FlowCommentRepo => new FlowCommentRepo(_workspaceDbContext);
    public ISupportTicketRepo SupportTicketRepo => new SupportTicketRepo(_workspaceDbContext);

    public ISupportTicketRemarkRepo SupportTicketRemarkRepo => new SupportTicketRemarkRepo(_workspaceDbContext);

    public IFlowLogRepo FlowLogRepo => new FlowLogRepo(_workspaceDbContext);

    public IFlowTemplateRepo FlowTemplateRepo => new FlowTemplateRepo(_workspaceDbContext);
    public IFlowVersionRepo FlowVersionRepo => new FlowVersionRepo(_workspaceDbContext);
    public ISubscriptionRepo SubscriptionRepo => new SubscriptionRepo(_workspaceDbContext);

    public IFlowExecutionLogRepo FlowExecutionLogRepo => new FlowExecutionLogRepo(_workspaceDbContext);

    public IActionExecutionLogRepo ActionExecutionLogRepo => new ActionExecutionLogRepo(_workspaceDbContext);

    public IMachineRepo MachineRepo => new MachineRepo(_workspaceDbContext);

    public IMachineFlowRepo MachineFlowRepo => new MachineFlowRepo(_workspaceDbContext);
    public IQueueRepo QueueRepo => new QueueRepo(_workspaceDbContext);
    public IQueueFlowVersionRepo QueueFlowVersionRepo => new QueueFlowVersionRepo(_workspaceDbContext);
    public IQueueTransactionRepo QueueTransactionRepo => new QueueTransactionRepo(_workspaceDbContext);
    public IJobRepo JobRepo => new JobRepo(_workspaceDbContext);
    public IKeyStoreRepo KeyStoreRepo => new KeyStoreRepo(_workspaceDbContext);
    public IVaultRepo VaultRepo => new VaultRepo(_workspaceDbContext);

    public ITriggerRepo TriggerRepo => new TriggerRepo(_workspaceDbContext);

    public ITriggerFlowRepo TriggerFlowRepo => new TriggerFlowRepo(_workspaceDbContext);
    public IFlowUserRepo FlowUserRepo => new FlowUserRepo(_workspaceDbContext);
    public IFlowBlockRepo FlowBlockRepo => new FlowBlockRepo(_workspaceDbContext);

    public async Task<bool> SaveAsync(bool checkHasChanges = false)
    {
        // Check change tracker first 
        if (checkHasChanges)
        {
            return _workspaceDbContext.ChangeTracker.HasChanges()
                ? await _workspaceDbContext.SaveChangesAsync() > 0
                : true;
        }

        // Save changes without checking change tracker
        return await _workspaceDbContext.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return _workspaceDbContext.ChangeTracker.HasChanges();
    }
}
