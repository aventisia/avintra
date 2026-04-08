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
    public IProjectTemplateRepo ProjectTemplateRepo => new ProjectTemplateRepo(_workspaceDbContext);
    public ITemplateResourceRepo TemplateResourceRepo => new TemplateResourceRepo(_workspaceDbContext);
    public IFlowVersionRepo FlowVersionRepo => new FlowVersionRepo(_workspaceDbContext);
    public IFlowVersionUserRepo FlowVersionUserRepo => new FlowVersionUserRepo(_workspaceDbContext);
    public IFlowVersionHistoryRepo FlowVersionHistoryRepo => new FlowVersionHistoryRepo(_workspaceDbContext);
    public IMachineRepo MachineRepo => new MachineRepo(_workspaceDbContext);
    public IMachineFlowRepo MachineFlowRepo => new MachineFlowRepo(_workspaceDbContext);
    public IQueueRepo QueueRepo => new QueueRepo(_workspaceDbContext);
    public IQueueFlowVersionRepo QueueFlowVersionRepo => new QueueFlowVersionRepo(_workspaceDbContext);
    public IQueueTransactionRepo QueueTransactionRepo => new QueueTransactionRepo(_workspaceDbContext);
    public IQueueUserRepo QueueUserRepo => new QueueUserRepo(_workspaceDbContext);
    public IJobRepo JobRepo => new JobRepo(_workspaceDbContext);
    public IKeyStoreRepo KeyStoreRepo => new KeyStoreRepo(_workspaceDbContext);
    public IVaultRepo VaultRepo => new VaultRepo(_workspaceDbContext);
    public ITimeTriggerRepo TimeTriggerRepo => new TimeTriggerRepo(_workspaceDbContext);
    public ITimeTriggerFlowRepo TimeTriggerFlowRepo => new TimeTriggerFlowRepo(_workspaceDbContext);
    public ITriggerRepo TriggerRepo => new TriggerRepo(_workspaceDbContext);
    public ITriggerFlowVersionRepo TriggerFlowVersionRepo => new TriggerFlowVersionRepo(_workspaceDbContext);
    public IFlowUserRepo FlowUserRepo => new FlowUserRepo(_workspaceDbContext);
    public IAppSecretRepo AppSecretRepo => new AppSecretRepo(_workspaceDbContext);
    public IEncryptedKeyValueRepo EncryptedKeyValueRepo => new EncryptedKeyValueRepo(_workspaceDbContext);
    public IAITaskRepo AITaskRepo => new AITaskRepo(_workspaceDbContext);
    public IOnPremModelRepo OnPremModelRepo => new OnPremModelRepo(_workspaceDbContext);
    public IConversationRepo ConversationRepo => new ConversationRepo(_workspaceDbContext);
    public IConversationMessageRepo ConversationMessageRepo => new ConversationMessageRepo(_workspaceDbContext);
    public IVectorStoreRepo VectorStoreRepo => new VectorStoreRepo(_workspaceDbContext);

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
