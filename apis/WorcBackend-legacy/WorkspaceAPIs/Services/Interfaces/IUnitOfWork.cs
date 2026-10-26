namespace WorkspaceAPIs.Services;

public interface IUnitOfWork
{
    IWorkspaceUserRepo WorkspaceUserRepo { get; }
    INotificationRepo NotificationRepo { get; }
    INotificationUserRepo NotificationUserRepo { get; }
    IFlowRepo FlowRepo { get; }
    IFlowVersionRepo FlowVersionRepo { get; }
    IFlowVersionHistoryRepo FlowVersionHistoryRepo { get; }
    IAgentRiskRegistryRepo AgentRiskRegistryRepo { get; }
    IMachineRepo MachineRepo { get; }
    IMachine_FlowVersionRepo Machine_FlowVersionRepo { get; }
    IProjectTemplateRepo ProjectTemplateRepo { get; }
    ITemplateResourceRepo TemplateResourceRepo { get; }
    IQueueRepo QueueRepo { get; }
    IQueueTransactionRepo QueueTransactionRepo { get; }
    IQueueTransactionEventRepo QueueTransactionEventRepo { get; }
    IQueueUserRepo QueueUserRepo { get; }
    IJobRepo JobRepo { get; }
    IJobNodeExecutionLogRepo JobNodeExecutionLogRepo { get; }
    IConfigStoreRepo ConfigStoreRepo { get; }
    ITriggerRepo TriggerRepo { get; }
    ITriggerFlowVersionRepo TriggerFlowVersionRepo { get; }
    IFlowUserRepo FlowUserRepo { get; }
    IVaultCredentialRepo VaultCredentialRepo { get; }
    IEncryptedKeyValueRepo EncryptedKeyValueRepo { get; }
    IOnPremModelRepo OnPremModelRepo { get; }
    ITenantModelProviderRepo TenantModelProviderRepo { get; }
    IConversationRepo ConversationRepo { get; }
    IConversationMessageRepo ConversationMessageRepo { get; }
    IVectorStoreRepo VectorStoreRepo { get; }
    IKnowledgeBaseRepo KnowledgeBaseRepo { get; }
    IKnowledgeBaseFileRepo KnowledgeBaseFileRepo { get; }
    IApiKeyRepo ApiKeyRepo { get; }
    IResourceShareRepo ResourceShareRepo { get; }
    IResourceFlowAccessRepo ResourceFlowAccessRepo { get; }
    ISkillRepo SkillRepo { get; }
    ISkillFileRepo SkillFileRepo { get; }
    IToolRepo ToolRepo { get; }
    ITicketRepo TicketRepo { get; }
    ITicketCommentRepo TicketCommentRepo { get; }
    ITicketAttachmentRepo TicketAttachmentRepo { get; }
    ITicketHistoryRepo TicketHistoryRepo { get; }

    /// <summary>
    /// Saves the changes made in the unit of work asynchronously.
    /// </summary>
    /// <param name="checkHasChanges">Optional. Specifies whether to check if there are any changes before saving. Default is false.</param>
    /// <returns>A task representing the asynchronous save operation. The task result is a boolean indicating whether the save operation was successful.</returns>
    Task<bool> SaveAsync(bool checkHasChanges = false);

    /// <summary>
    /// Checks if there are any pending changes in the unit of work.
    /// </summary>
    /// <returns>True if there are pending changes, otherwise false.</returns>
    bool HasChanges();

    /// <summary>
    /// Runs the supplied operation inside a single database transaction. The transaction is
    /// committed when the operation completes and rolled back when it throws, so callers get
    /// all-or-nothing semantics across multiple repository saves.
    /// </summary>
    /// <param name="operation">The asynchronous work to execute atomically.</param>
    Task ExecuteInTransactionAsync(Func<Task> operation);

    /// <summary>
    /// Acquires a transaction-scoped PostgreSQL advisory lock for a logical resource key.
    /// </summary>
    Task AcquireAdvisoryLockAsync(string resourceKey);
}
