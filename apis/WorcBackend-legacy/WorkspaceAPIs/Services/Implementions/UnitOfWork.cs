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
    public IFolderRepo FolderRepo => new FolderRepo(_workspaceDbContext);
    public IProjectTemplateRepo ProjectTemplateRepo => new ProjectTemplateRepo(_workspaceDbContext);
    public ITemplateResourceRepo TemplateResourceRepo => new TemplateResourceRepo(_workspaceDbContext);
    public IFlowVersionRepo FlowVersionRepo => new FlowVersionRepo(_workspaceDbContext);
    public IFlowVersionHistoryRepo FlowVersionHistoryRepo => new FlowVersionHistoryRepo(_workspaceDbContext);
    public IAgentRiskRegistryRepo AgentRiskRegistryRepo => new AgentRiskRegistryRepo(_workspaceDbContext);
    public IMachineRepo MachineRepo => new MachineRepo(_workspaceDbContext);
    public IMachine_FlowVersionRepo Machine_FlowVersionRepo => new Machine_FlowVersionRepo(_workspaceDbContext);
    public IQueueRepo QueueRepo => new QueueRepo(_workspaceDbContext);
    public IQueueTransactionRepo QueueTransactionRepo => new QueueTransactionRepo(_workspaceDbContext);
    public IQueueTransactionEventRepo QueueTransactionEventRepo => new QueueTransactionEventRepo(_workspaceDbContext);
    public IQueueUserRepo QueueUserRepo => new QueueUserRepo(_workspaceDbContext);
    public IJobRepo JobRepo => new JobRepo(_workspaceDbContext);
    public IJobNodeExecutionLogRepo JobNodeExecutionLogRepo => new JobNodeExecutionLogRepo(_workspaceDbContext);
    public IConfigStoreRepo ConfigStoreRepo => new ConfigStoreRepo(_workspaceDbContext);
    public ITriggerRepo TriggerRepo => new TriggerRepo(_workspaceDbContext);
    public ITriggerFlowVersionRepo TriggerFlowVersionRepo => new TriggerFlowVersionRepo(_workspaceDbContext);
    public IFlowUserRepo FlowUserRepo => new FlowUserRepo(_workspaceDbContext);
    public IVaultCredentialRepo VaultCredentialRepo => new VaultCredentialRepo(_workspaceDbContext);
    public IEncryptedKeyValueRepo EncryptedKeyValueRepo => new EncryptedKeyValueRepo(_workspaceDbContext);
    public IOnPremModelRepo OnPremModelRepo => new OnPremModelRepo(_workspaceDbContext);
    public ITenantModelProviderRepo TenantModelProviderRepo => new TenantModelProviderRepo(_workspaceDbContext);
    public IConversationRepo ConversationRepo => new ConversationRepo(_workspaceDbContext);
    public IConversationMessageRepo ConversationMessageRepo => new ConversationMessageRepo(_workspaceDbContext);
    public IVectorStoreRepo VectorStoreRepo => new VectorStoreRepo(_workspaceDbContext);
    public IKnowledgeBaseRepo KnowledgeBaseRepo => new KnowledgeBaseRepo(_workspaceDbContext);
    public IKnowledgeBaseFileRepo KnowledgeBaseFileRepo => new KnowledgeBaseFileRepo(_workspaceDbContext);
    public IApiKeyRepo ApiKeyRepo => new ApiKeyRepo(_workspaceDbContext);
    public IResourceUserAccessRepo ResourceUserAccessRepo => new ResourceUserAccessRepo(_workspaceDbContext);
    public IResourceFlowAccessRepo ResourceFlowAccessRepo => new ResourceFlowAccessRepo(_workspaceDbContext);
    public ISkillRepo SkillRepo => new SkillRepo(_workspaceDbContext);
    public ISkillFileRepo SkillFileRepo => new SkillFileRepo(_workspaceDbContext);
    public IToolRepo ToolRepo => new ToolRepo(_workspaceDbContext);
    public IPlatformToolRepo PlatformToolRepo => new PlatformToolRepo(_workspaceDbContext);
    public ITenantPlatformToolRepo TenantPlatformToolRepo => new TenantPlatformToolRepo(_workspaceDbContext);
    public ITicketRepo TicketRepo => new TicketRepo(_workspaceDbContext);
    public ITicketCommentRepo TicketCommentRepo => new TicketCommentRepo(_workspaceDbContext);
    public ITicketAttachmentRepo TicketAttachmentRepo => new TicketAttachmentRepo(_workspaceDbContext);
    public ITicketHistoryRepo TicketHistoryRepo => new TicketHistoryRepo(_workspaceDbContext);

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

    public Task ExecuteInTransactionAsync(Func<Task> operation)
    {
        return _workspaceDbContext.Database.ExecuteInTransactionAsync(operation);
    }

    public Task AcquireAdvisoryLockAsync(string resourceKey)
    {
        return _workspaceDbContext.Database.AcquireAdvisoryLockAsync(resourceKey);
    }
}
