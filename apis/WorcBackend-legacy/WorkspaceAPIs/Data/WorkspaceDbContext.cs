/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

namespace WorkspaceAPIs.Data;

public class WorkspaceDbContext : DbContext
{
    private readonly ICurrentTenantService _currentTenantService;
    private Guid CurrentTenantId { get; set; }

    public WorkspaceDbContext(
        ICurrentTenantService currentTenantService,
        DbContextOptions<WorkspaceDbContext> options) : base(options)
    {
        _currentTenantService = currentTenantService;
        CurrentTenantId = _currentTenantService.CurrentTenantId;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global TenantId filters
        modelBuilder.Entity<Notification>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<NotificationUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Flow>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowComment>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<SupportTicket>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<SupportTicketRemark>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowLog>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<MachineFlow>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowVersionHistory>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Queue>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<QueueFlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<QueueTransaction>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<KeyStore>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Vault>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<AppSecret>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Machine>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TimeTrigger>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TimeTriggersFlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Trigger>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TriggerFlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Job>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<OnPremModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Conversation>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ConversationMessage>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<VectorStore>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<KnowledgeBase>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<KnowledgeBaseFile>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

        // TODO: Remove this temporary migration code after all legacy user mapping data
        // (FlowUser, FlowVersionUser, and QueueUser) has been successfully migrated
        // to ResourceShare in all environments.
        // Apply global query filters to ensure users only see data elonging to the current tenant in a multi-tenant environment.
        if (CurrentTenantId != Guid.Empty)
        {
            modelBuilder.Entity<FlowUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
            modelBuilder.Entity<FlowVersionUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
            modelBuilder.Entity<QueueUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
            modelBuilder.Entity<ResourceShare>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        }

        // Unique property
        modelBuilder.Entity<WorkspaceUser>().HasIndex(index => index.UserName).IsUnique();
        modelBuilder.Entity<Flow>().HasIndex(index => new { index.CreatedByUserId, index.Name }).IsUnique();
        modelBuilder.Entity<SupportTicket>().HasIndex(index => index.TicketNumber).IsUnique();
        modelBuilder.Entity<KnowledgeBase>().HasIndex(index => new { index.TenantId, index.Name }).IsUnique();
        modelBuilder.Entity<KnowledgeBaseFile>().HasIndex(index => new { index.KnowledgeBaseId, index.FileName }).IsUnique();
        modelBuilder.Entity<ResourceShare>().HasIndex(index => new { index.ResourceId, index.UserId }).IsUnique();

        // Enum to string conversion
        modelBuilder.Entity<Notification>().Property(e => e.Type).HasConversion(new EnumToStringConverter<NotificationTypesEnum>());
        modelBuilder.Entity<Flow>().Property(e => e.Type).HasConversion(new EnumToStringConverter<FlowTypesEnum>());
        modelBuilder.Entity<FlowLog>().Property(e => e.Status).HasConversion(new EnumToStringConverter<FlowLogStatusEnum>());
        modelBuilder.Entity<ProjectTemplate>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ProjectTemplateTypesEnum>());
        modelBuilder.Entity<ProjectTemplate>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ProjectTemplateStatusesEnum>());
        modelBuilder.Entity<ProjectTemplate>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<TemplateAccessTypesEnum>());
        modelBuilder.Entity<Machine>().Property(e => e.Type).HasConversion(new EnumToStringConverter<MachineTypeEnum>());
        modelBuilder.Entity<Machine>().Property(e => e.Status).HasConversion(new EnumToStringConverter<MachineStatusTypeEnum>());
        modelBuilder.Entity<Machine>().Property(e => e.Environment).HasConversion(new EnumToStringConverter<EnvironmentTypesEnum>());
        modelBuilder.Entity<Queue>().Property(e => e.Type).HasConversion(new EnumToStringConverter<QueueTypesEnum>());
        modelBuilder.Entity<Queue>().Property(e => e.ViewType).HasConversion(new EnumToStringConverter<QueueViewTypeEnum>());
        modelBuilder.Entity<QueueTransaction>().Property(e => e.Status).HasConversion(new EnumToStringConverter<QueueTransactionStatusTypesEnum>());
        modelBuilder.Entity<QueueTransactionEvent>().Property(e => e.EventType).HasConversion(new EnumToStringConverter<QueueTransactionEventEnum>());
        modelBuilder.Entity<QueueUser>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<QueueWorkItemAccessTypesEnum>());
        modelBuilder.Entity<QueueFlowVersion>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<QueueWorkItemAccessTypesEnum>());
        modelBuilder.Entity<KeyStore>().Property(e => e.Type).HasConversion(new EnumToStringConverter<KeyStoreTypesEnum>());
        modelBuilder.Entity<KeyStore>().Property(e => e.AccessLevel).HasConversion(new EnumToStringConverter<AccessLevelTypesEnum>());
        modelBuilder.Entity<TimeTrigger>().Property(e => e.Frequency).HasConversion(new EnumToStringConverter<TriggerFrequencyTypesEnum>());
        modelBuilder.Entity<Trigger>().Property(e => e.TriggerType).HasConversion(new EnumToStringConverter<TriggerTypesEnum>());
        modelBuilder.Entity<FlowUser>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ProjectUserAccessEnum>());
        modelBuilder.Entity<AppSecret>().Property(e => e.Type).HasConversion(new EnumToStringConverter<AppSecretTypesEnum>());
        modelBuilder.Entity<Job>().Property(e => e.Status).HasConversion(new EnumToStringConverter<JobStatusEnum>());
        modelBuilder.Entity<Job>().Property(e => e.Priority).HasConversion(new EnumToStringConverter<JobPriorityEnum>());
        modelBuilder.Entity<Job>().Property(e => e.TriggerType).HasConversion(new EnumToStringConverter<TriggerTypesEnum>());
        modelBuilder.Entity<OnPremModel>().Property(e => e.ProviderType).HasConversion(new EnumToStringConverter<OnPremModelProviderEnum>());
        modelBuilder.Entity<OnPremModel>().Property(e => e.Status).HasConversion(new EnumToStringConverter<OnPremModelStatusEnum>());
        modelBuilder.Entity<Conversation>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ConversationStatusEnum>());
        modelBuilder.Entity<ConversationMessage>().Property(e => e.Role).HasConversion(new EnumToStringConverter<ConversationMessageSenderEnum>());
        modelBuilder.Entity<KnowledgeBase>().Property(e => e.VectorStore).HasConversion(new EnumToStringConverter<VectorStoreEnum>());
        modelBuilder.Entity<KnowledgeBaseFile>().Property(e => e.Status).HasConversion(new EnumToStringConverter<VectorizationStatusEnum>());
        modelBuilder.Entity<PromptTemplate>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<PromptTemplateAccessTypeEnum>());
        modelBuilder.Entity<ResourceShare>().Property(e => e.AccessLevel).HasConversion(new EnumToStringConverter<ResourceAccessTypeEnum>());
        modelBuilder.Entity<ResourceShare>().Property(e => e.ResourceType).HasConversion(new EnumToStringConverter<ResourceTypeEnum>());

        // Configure Many-to-Many relationship between User and Notification
        modelBuilder.Entity<WorkspaceUser>().HasMany(many => many.NotificationUsers).WithOne(one => one.User).HasForeignKey(fKey => fKey.UserId).IsRequired();
        modelBuilder.Entity<Notification>().HasMany(many => many.NotificationUsers).WithOne(one => one.Notification).HasForeignKey(fKey => fKey.NotificationId).IsRequired();

        // Configure Many-to-Many relationship between Machine and flow
        modelBuilder.Entity<Machine>().HasMany(many => many.MachineFlows).WithOne(one => one.Machine).HasForeignKey(fKey => fKey.MachineId).IsRequired();
        modelBuilder.Entity<FlowVersion>().HasMany(many => many.MachineFlows).WithOne(one => one.FlowVersion).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired();

        // Configure One-to-Many relationship
        modelBuilder.Entity<Flow>().HasMany(many => many.FlowLog).WithOne(one => one.Flow).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Flow>().HasMany(f => f.FlowVersions).WithOne(one => one.Flow).HasForeignKey(fKey => fKey.FlowId).IsRequired();
        modelBuilder.Entity<Queue>().HasMany(many => many.QueueTransactions).WithOne(one => one.Queue).HasForeignKey(fKey => fKey.QueueId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowVersion>().HasMany(many => many.Jobs).WithOne(one => one.FlowVersion).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired();
        modelBuilder.Entity<EncryptedKeyValue>().HasOne(one => one.AppSecret).WithMany(many => many.EncryptedKeyValues).HasForeignKey(fKey => fKey.AppSecretId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<QueueFlowVersion>().HasOne(one => one.Queue).WithMany(many => many.QueueFlowVersions).HasForeignKey(fKey => fKey.QueueId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<QueueTransactionEvent>().HasOne(one => one.QueueTransaction).WithMany(many => many.QueueTransactionEvents).HasForeignKey(fKey => fKey.QueueTransactionId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<QueueUser>().HasOne(one => one.Queue).WithMany(many => many.QueueUsers).HasForeignKey(fKey => fKey.QueueId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<MachineFlow>().HasOne(one => one.Machine).WithMany(many => many.MachineFlows).HasForeignKey(fKey => fKey.MachineId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowComment>().HasOne(one => one.Flow).WithMany(many => many.FlowComments).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowVersion>().HasOne(one => one.Flow).WithMany(many => many.FlowVersions).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowLog>().HasOne(one => one.Flow).WithMany(many => many.FlowLog).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowUser>().HasOne(one => one.Flow).WithMany(many => many.FlowUsers).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TemplateResource>().HasOne(one => one.ProjectTemplate).WithMany(many => many.TemplateResources).HasForeignKey(fKey => fKey.ProjectTemplateId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SupportTicketRemark>().HasOne(one => one.SupportTicket).WithMany(many => many.SupportTicketRemarks).HasForeignKey(fKey => fKey.SupportTicketId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<NotificationUser>().HasOne(one => one.Notification).WithMany(many => many.NotificationUsers).HasForeignKey(fKey => fKey.NotificationId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<KnowledgeBaseFile>().HasOne(one => one.KnowledgeBase).WithMany(many => many.Files).HasForeignKey(fKey => fKey.KnowledgeBaseId).IsRequired().OnDelete(DeleteBehavior.Cascade);

        // Configure One-to-One relationship between Notification and WorkspaceUser
        modelBuilder.Entity<Notification>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Notification>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Flow and WorkspaceUser
        modelBuilder.Entity<Flow>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Flow>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between SupportTicket and WorkspaceUser
        modelBuilder.Entity<SupportTicket>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<SupportTicket>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many relationship between FlowVersion and TriggerFlowVersions (@rahmat, Validate)
        modelBuilder.Entity<TimeTriggersFlowVersion>().HasOne(one => one.Trigger).WithMany(many => many.TimeTriggerFlowVersions).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired().OnDelete(DeleteBehavior.Cascade); ;

        // Configure One-to-Many relationship between TimeTriggersFlowVersion and Trigger (@rahmat, Validate)
        modelBuilder.Entity<TimeTriggersFlowVersion>().HasOne(one => one.Trigger).WithMany(many => many.TimeTriggerFlowVersions).HasForeignKey(fKey => fKey.TriggerId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowVersionHistory>().HasOne(one => one.FlowVersion).WithMany(many => many.FlowVersionHistories).HasForeignKey(fKey => fKey.FlowVersionId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FlowVersionUser>().HasOne(one => one.FlowVersion).WithMany(many => many.FlowVersionUsers).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Conversation>().HasOne(one => one.FlowVersion).WithMany(many => many.Conversations).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ConversationMessage>().HasOne(one => one.Conversation).WithMany(many => many.Messages).HasForeignKey(fKey => fKey.ConversationId).IsRequired().OnDelete(DeleteBehavior.Cascade);

        // Registers the pgvector extension in PostgreSQL.
        // CRITICAL: Must be enabled before migrations or any vector column usage, otherwise the application will fail at runtime.
        modelBuilder.HasPostgresExtension("vector");

        // Maps Embedding to a 1536-dimension PostgreSQL vector column.
        // CRITICAL: Dimension must exactly match the embedding model output, or inserts and similarity queries will fail.
        modelBuilder.Entity<VectorStore>()
                .Property(x => x.Embedding)
                .HasColumnType("vector(1536)");
    }
    // On Save Changes - write tenant Id to table
    public override int SaveChanges()
    {
        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>().ToList())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.TenantId = CurrentTenantId;
                    break;
            }
        }
        var result = base.SaveChanges();

        return result;
    }

    // On Save Changes Async - write tenant Id to table
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>().ToList())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.TenantId = CurrentTenantId;
                    break;
            }
        }
        var result = await base.SaveChangesAsync(cancellationToken);
        return result;
    }

    public DbSet<WorkspaceUser> Users { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<NotificationUser> NotificationUsers { get; set; }
    public DbSet<Flow> Flows { get; set; }
    public DbSet<FlowComment> FlowComments { get; set; }
    public DbSet<SupportTicket> SupportTickets { get; set; }
    public DbSet<SupportTicketRemark> SupportTicketRemarks { get; set; }
    public DbSet<FlowLog> FlowLog { get; set; }
    public DbSet<ProjectTemplate> ProjectTemplates { get; set; }
    public DbSet<TemplateResource> TemplateResources { get; set; }
    public DbSet<FlowVersion> FlowVersions { get; set; }
    public DbSet<FlowVersionUser> FlowVersionUsers { get; set; }
    public DbSet<FlowVersionHistory> FlowVersionHistories { get; set; }
    public DbSet<Queue> Queues { get; set; }
    public DbSet<QueueTransaction> QueueTransactions { get; set; }
    public DbSet<QueueTransactionEvent> QueueTransactionEvents { get; set; }
    public DbSet<QueueUser> QueueUsers { get; set; }
    public DbSet<Job> Jobs { get; set; }
    public DbSet<KeyStore> KeyStores { get; set; }
    public DbSet<Vault> Vaults { get; set; }
    public DbSet<FlowUser> FlowUsers { get; set; }
    public DbSet<TimeTrigger> TimeTriggers { get; set; }
    public DbSet<TimeTriggersFlowVersion> TimeTriggersFlowVersions { get; set; }
    public DbSet<Trigger> Triggers { get; set; }
    public DbSet<TriggerFlowVersion> TriggerFlowVersions { get; set; }
    public DbSet<AppSecret> AppSecrets { get; set; }
    public DbSet<EncryptedKeyValue> EncryptedKeyValues { get; set; }
    public DbSet<PromptTemplate> PromptTemplates { get; set; }
    public DbSet<OnPremModel> OnPremModels { get; set; }
    public DbSet<VectorStore> VectorStores { get; set; }
    public DbSet<KnowledgeBase> KnowledgeBases { get; set; }
    public DbSet<KnowledgeBaseFile> KnowledgeBaseFiles { get; set; }
    public DbSet<ResourceShare> ResourceShares { get; set; }
}