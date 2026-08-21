/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

namespace WorkspaceAPIs.Data;

public class WorkspaceDbContext : DbContext
{
    private readonly ICurrentTenantService _currentTenantService;
    private Guid CurrentTenantId { get; set; }
    private Guid CurrentSpaceId { get; set; }

    public WorkspaceDbContext(
        ICurrentTenantService currentTenantService,
        DbContextOptions<WorkspaceDbContext> options) : base(options)
    {
        _currentTenantService = currentTenantService;
        CurrentTenantId = _currentTenantService.CurrentTenantId;
        CurrentSpaceId = _currentTenantService.CurrentSpaceId;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global TenantId filters
        modelBuilder.Entity<Notification>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<NotificationUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowComment>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<SupportTicket>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<SupportTicketRemark>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Ticket>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TicketComment>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TicketAttachment>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TicketHistory>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowLog>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Machine_FlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowVersionHistory>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<AgentRiskRegistry>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<QueueFlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<QueueTransaction>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TimeTriggersFlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TriggerFlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<OnPremModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TenantModelProvider>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ConversationMessage>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<VectorStore>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<JobNodeExecutionLog>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowVersion_Tool>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

        // Global SpaceId + TenantId filters.
        // Each entity is scoped by BOTH its owning tenant and its space:
        // - Tenant: only rows belonging to the current tenant.
        // - Space: Central (Guid.Empty) shows only rows in the Central space (SpaceId == null);
        //   a specific space shows only rows in that space.
        // These two conditions MUST be combined in a single HasQueryFilter call, because calling
        // HasQueryFilter twice on the same entity REPLACES the previous filter rather than ANDing it.
        modelBuilder.Entity<Flow>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<FlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<Queue>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<KeyStore>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<Vault>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<AppSecret>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<KnowledgeBase>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<KnowledgeBaseFile>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<Skill>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<SkillFile>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<Tool>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<Machine>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<Job>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<Conversation>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<ApiKey>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<TimeTrigger>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));
        modelBuilder.Entity<Trigger>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId && (CurrentSpaceId == Guid.Empty ? qf.SpaceId == null : qf.SpaceId == CurrentSpaceId));

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
        modelBuilder.Entity<Machine>().HasIndex(index => new { index.Name }).IsUnique();
        modelBuilder.Entity<SupportTicket>().HasIndex(index => index.TicketNumber).IsUnique();
        modelBuilder.Entity<Ticket>().HasIndex(index => index.TicketNumber).IsUnique();
        modelBuilder.Entity<KnowledgeBase>().HasIndex(index => new { index.TenantId, index.SpaceId, index.EnvType, index.Name }).IsUnique();
        modelBuilder.Entity<KnowledgeBaseFile>().HasIndex(index => new { index.KnowledgeBaseId, index.FileName }).IsUnique();
        modelBuilder.Entity<ResourceShare>().HasIndex(index => new { index.ResourceId, index.UserId }).IsUnique();
        modelBuilder.Entity<ApiKey>().HasIndex(index => index.KeyHash).IsUnique();
        modelBuilder.Entity<ApiKey>().OwnsOne(e => e.Permissions, permissions =>
        {
            permissions.ToJson();
        });
        modelBuilder.Entity<ApiKey>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ApiKey>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Skill>().HasIndex(index => new { index.TenantId, index.SpaceId, index.EnvType, index.Name }).IsUnique();
        modelBuilder.Entity<SkillFile>().HasIndex(index => new { index.SkillId, index.FileName }).IsUnique();
        modelBuilder.Entity<Tool>().HasIndex(index => new { index.TenantId, index.SpaceId, index.EnvType, index.Name }).IsUnique();
        modelBuilder.Entity<FlowVersion_Tool>().HasIndex(index => new { index.TenantId, index.FlowVersionId, index.ToolId }).IsUnique();
        modelBuilder.Entity<Queue>().HasIndex(index => new { index.TenantId, index.SpaceId, index.EnvType, index.Name }).IsUnique();
        modelBuilder.Entity<KeyStore>().HasIndex(index => new { index.TenantId, index.SpaceId, index.EnvType, index.Name }).IsUnique();
        modelBuilder.Entity<Vault>().HasIndex(index => new { index.TenantId, index.SpaceId, index.EnvType, index.Name }).IsUnique();
        modelBuilder.Entity<AppSecret>().HasIndex(index => new { index.TenantId, index.SpaceId, index.EnvType, index.Name }).IsUnique();
        modelBuilder.Entity<Trigger>().HasIndex(index => new { index.TenantId, index.SpaceId, index.EnvType, index.Name }).IsUnique();

        // Enum to string conversion
        modelBuilder.Entity<Notification>().Property(e => e.Type).HasConversion(new EnumToStringConverter<NotificationTypesEnum>());
        modelBuilder.Entity<Notification>().Property(e => e.SourceType).HasConversion(new EnumToStringConverter<NotificationSourceEnum>());
        modelBuilder.Entity<Notification>().Property(e => e.DeliveryChannel).HasConversion(new EnumToStringConverter<DeliveryChannelEnum>());
        modelBuilder.Entity<Notification>().Property(e => e.AudienceScope).HasConversion(new EnumToStringConverter<AudienceScopeEnum>());
        modelBuilder.Entity<Notification>().Property(e => e.Status).HasConversion(new EnumToStringConverter<NotificationStatusEnum>());
        modelBuilder.Entity<Notification>().Property(e => e.RecurrenceFrequency).HasConversion(new EnumToStringConverter<NotificationRecurrenceEnum>());
        modelBuilder.Entity<Flow>().Property(e => e.Type).HasConversion(new EnumToStringConverter<FlowTypesEnum>());
        modelBuilder.Entity<FlowLog>().Property(e => e.Status).HasConversion(new EnumToStringConverter<FlowLogStatusEnum>());
        modelBuilder.Entity<ProjectTemplate>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ProjectTemplateTypesEnum>());
        modelBuilder.Entity<ProjectTemplate>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ProjectTemplateStatusesEnum>());
        modelBuilder.Entity<ProjectTemplate>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<TemplateAccessTypesEnum>());
        modelBuilder.Entity<Machine>().Property(e => e.OperatingSystem).HasConversion(new EnumToStringConverter<OsTypesEnum>());
        modelBuilder.Entity<Queue>().Property(e => e.Type).HasConversion(new EnumToStringConverter<QueueTypesEnum>());
        modelBuilder.Entity<Queue>().Property(e => e.ProcessingMode).HasConversion(new EnumToStringConverter<QueueProcessingModeEnum>());
        modelBuilder.Entity<QueueTransactionEvent>().Property(e => e.EventType).HasConversion(new EnumToStringConverter<QueueTransactionEventEnum>());
        modelBuilder.Entity<QueueUser>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<QueueWorkItemAccessTypesEnum>());
        modelBuilder.Entity<QueueFlowVersion>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<QueueWorkItemAccessTypesEnum>());
        modelBuilder.Entity<KeyStore>().Property(e => e.Type).HasConversion(new EnumToStringConverter<KeyStoreTypesEnum>());
        modelBuilder.Entity<KeyStore>().Property(e => e.AccessLevel).HasConversion(new EnumToStringConverter<AccessLevelTypesEnum>());
        modelBuilder.Entity<KeyStore>().Property(e => e.EnvType).HasConversion(new EnumToStringConverter<ConfigureEnvironmentType>()).HasDefaultValue(ConfigureEnvironmentType.Dev);
        modelBuilder.Entity<TimeTrigger>().Property(e => e.Frequency).HasConversion(new EnumToStringConverter<TriggerFrequencyTypesEnum>());
        modelBuilder.Entity<Trigger>().Property(e => e.TriggerType).HasConversion(new EnumToStringConverter<TriggerTypesEnum>());
        modelBuilder.Entity<Trigger>().Property(e => e.EnvType).HasConversion(new EnumToStringConverter<ConfigureEnvironmentType>()).HasDefaultValue(ConfigureEnvironmentType.Dev);
        modelBuilder.Entity<Queue>().Property(e => e.EnvType).HasConversion(new EnumToStringConverter<ConfigureEnvironmentType>()).HasDefaultValue(ConfigureEnvironmentType.Dev);
        modelBuilder.Entity<Vault>().Property(e => e.EnvType).HasConversion(new EnumToStringConverter<ConfigureEnvironmentType>()).HasDefaultValue(ConfigureEnvironmentType.Dev);
        modelBuilder.Entity<AppSecret>().Property(e => e.EnvType).HasConversion(new EnumToStringConverter<ConfigureEnvironmentType>()).HasDefaultValue(ConfigureEnvironmentType.Dev);
        modelBuilder.Entity<FlowUser>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ProjectUserAccessEnum>());
        modelBuilder.Entity<AppSecret>().Property(e => e.Type).HasConversion(new EnumToStringConverter<AppSecretTypesEnum>());
        modelBuilder.Entity<Job>().Property(e => e.Status).HasConversion(new EnumToStringConverter<JobStatusEnum>());
        modelBuilder.Entity<Job>().Property(e => e.Priority).HasConversion(new EnumToStringConverter<JobPriorityEnum>());
        modelBuilder.Entity<Job>().Property(e => e.TriggerType).HasConversion(new EnumToStringConverter<TriggerTypesEnum>());
        modelBuilder.Entity<OnPremModel>().Property(e => e.ProviderType).HasConversion(new EnumToStringConverter<OnPremModelProviderEnum>());
        modelBuilder.Entity<OnPremModel>().Property(e => e.Status).HasConversion(new EnumToStringConverter<OnPremModelStatusEnum>());
        modelBuilder.Entity<TenantModelProvider>().Property(e => e.ProviderType).HasConversion(new EnumToStringConverter<LLMProviderTypesEnum>());
        modelBuilder.Entity<TenantModelProvider>().Property(e => e.EnabledModelIds)
            .HasColumnType("jsonb")
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
            .Metadata.SetValueComparer(
                new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                    (a, b) => a.SequenceEqual(b),
                    c => c.Aggregate(0, (acc, s) => HashCode.Combine(acc, s.GetHashCode())),
                    c => c.ToList()));
        modelBuilder.Entity<Conversation>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ConversationStatusEnum>());
        modelBuilder.Entity<ConversationMessage>().Property(e => e.Role).HasConversion(new EnumToStringConverter<ConversationMessageSenderEnum>());
        modelBuilder.Entity<KnowledgeBase>().Property(e => e.VectorStore).HasConversion(new EnumToStringConverter<VectorStoreEnum>());
        modelBuilder.Entity<KnowledgeBase>().Property(e => e.EnvType).HasConversion(new EnumToStringConverter<ConfigureEnvironmentType>()).HasDefaultValue(ConfigureEnvironmentType.Dev);
        modelBuilder.Entity<KnowledgeBaseFile>().Property(e => e.Status).HasConversion(new EnumToStringConverter<VectorizationStatusEnum>());
        modelBuilder.Entity<PromptTemplate>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<PromptTemplateAccessTypeEnum>());
        modelBuilder.Entity<ResourceShare>().Property(e => e.AccessLevel).HasConversion(new EnumToStringConverter<ResourceAccessTypeEnum>());
        modelBuilder.Entity<ResourceShare>().Property(e => e.ResourceType).HasConversion(new EnumToStringConverter<ResourceTypeEnum>());
        modelBuilder.Entity<Skill>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ComponentTypeEnum>());
        modelBuilder.Entity<Skill>().Property(e => e.EnvType).HasConversion(new EnumToStringConverter<ConfigureEnvironmentType>()).HasDefaultValue(ConfigureEnvironmentType.Dev);
        modelBuilder.Entity<Tool>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ComponentTypeEnum>());
        modelBuilder.Entity<Tool>().Property(e => e.AuthenticationType).HasConversion(new EnumToStringConverter<ToolAuthenticationTypeEnum>());
        modelBuilder.Entity<Tool>().Property(e => e.EnvType).HasConversion(new EnumToStringConverter<ConfigureEnvironmentType>()).HasDefaultValue(ConfigureEnvironmentType.Dev);

        // Ticket enum to string conversion
        modelBuilder.Entity<Ticket>().Property(e => e.RequestType).HasConversion(new EnumToStringConverter<RequestTypeEnum>());
        modelBuilder.Entity<Ticket>().Property(e => e.Status).HasConversion(new EnumToStringConverter<TicketStatusEnum>());
        modelBuilder.Entity<Ticket>().Property(e => e.Complexity).HasConversion(new EnumToStringConverter<ComplexityEnum>());
        modelBuilder.Entity<Ticket>().Property(e => e.RiskLevel).HasConversion(new EnumToStringConverter<RiskLevelEnum>());

        // AgentRiskRegistry enum-to-string conversions
        modelBuilder.Entity<AgentRiskRegistry>().Property(e => e.CompositeTier).HasConversion(new EnumToStringConverter<AgentRiskTierEnum>());
        modelBuilder.Entity<AgentRiskRegistry>().Property(e => e.Status).HasConversion(new EnumToStringConverter<AgentRiskLifecycleStatusEnum>());
        modelBuilder.Entity<AgentRiskRegistry>().HasIndex(index => new { index.FlowVersionId }).IsUnique();

        // Configure Many-to-Many relationship between User and Notification
        modelBuilder.Entity<WorkspaceUser>().HasMany(many => many.NotificationUsers).WithOne(one => one.User).HasForeignKey(fKey => fKey.UserId).IsRequired();
        modelBuilder.Entity<Notification>().HasMany(many => many.NotificationUsers).WithOne(one => one.Notification).HasForeignKey(fKey => fKey.NotificationId).IsRequired();

        // Configure Many-to-Many relationship between Machine and flow
        modelBuilder.Entity<Machine_FlowVersion>().HasKey(mf => new { mf.MachineId, mf.FlowVersionId });
        modelBuilder.Entity<Machine>().HasMany(many => many.MachineFlowVersions).WithOne(one => one.Machine).HasForeignKey(fKey => fKey.MachineId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowVersion>().HasMany(many => many.FlowVersionMachines).WithOne(one => one.FlowVersion).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired();

        // Configure One-to-Many relationship between User and Machine
        modelBuilder.Entity<Machine>().HasOne(one => one.User).WithMany(many => many.Machines).HasForeignKey(fKey => fKey.UserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many relationship
        modelBuilder.Entity<Flow>().HasMany(many => many.FlowLog).WithOne(one => one.Flow).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Flow>().HasMany(f => f.FlowVersions).WithOne(one => one.Flow).HasForeignKey(fKey => fKey.FlowId).IsRequired();
        modelBuilder.Entity<Queue>().HasMany(many => many.QueueTransactions).WithOne(one => one.Queue).HasForeignKey(fKey => fKey.QueueId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowVersion>().HasMany(many => many.Jobs).WithOne(one => one.FlowVersion).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired();
        modelBuilder.Entity<EncryptedKeyValue>().HasOne(one => one.AppSecret).WithMany(many => many.EncryptedKeyValues).HasForeignKey(fKey => fKey.AppSecretId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<QueueFlowVersion>().HasOne(one => one.Queue).WithMany(many => many.QueueFlowVersions).HasForeignKey(fKey => fKey.QueueId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<QueueTransactionEvent>().HasOne(one => one.QueueTransaction).WithMany(many => many.QueueTransactionEvents).HasForeignKey(fKey => fKey.QueueTransactionId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<QueueUser>().HasOne(one => one.Queue).WithMany(many => many.QueueUsers).HasForeignKey(fKey => fKey.QueueId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowComment>().HasOne(one => one.Flow).WithMany(many => many.FlowComments).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowVersion>().HasOne(one => one.Flow).WithMany(many => many.FlowVersions).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowLog>().HasOne(one => one.Flow).WithMany(many => many.FlowLog).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowUser>().HasOne(one => one.Flow).WithMany(many => many.FlowUsers).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TemplateResource>().HasOne(one => one.ProjectTemplate).WithMany(many => many.TemplateResources).HasForeignKey(fKey => fKey.ProjectTemplateId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<SupportTicketRemark>().HasOne(one => one.SupportTicket).WithMany(many => many.SupportTicketRemarks).HasForeignKey(fKey => fKey.SupportTicketId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TicketComment>().HasOne(one => one.Ticket).WithMany(many => many.Comments).HasForeignKey(fKey => fKey.TicketId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TicketComment>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TicketComment>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TicketAttachment>().HasOne(one => one.Ticket).WithMany(many => many.Attachments).HasForeignKey(fKey => fKey.TicketId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TicketHistory>().HasOne(one => one.Ticket).WithMany(many => many.History).HasForeignKey(fKey => fKey.TicketId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<NotificationUser>().HasOne(one => one.Notification).WithMany(many => many.NotificationUsers).HasForeignKey(fKey => fKey.NotificationId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<KnowledgeBaseFile>().HasOne(one => one.KnowledgeBase).WithMany(many => many.Files).HasForeignKey(fKey => fKey.KnowledgeBaseId).IsRequired().OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SkillFile>()
            .HasOne(one => one.Skill)
            .WithMany(many => many.Files)
            .HasForeignKey(fKey => fKey.SkillId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        // Configure One-to-One relationship between Tool and WorkspaceUser
        modelBuilder.Entity<Tool>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Tool>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure Many-to-Many relationship between FlowVersion and Tool
        modelBuilder.Entity<FlowVersion_Tool>()
            .HasOne(one => one.FlowVersion)
            .WithMany()
            .HasForeignKey(fKey => fKey.FlowVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FlowVersion_Tool>()
            .HasOne(one => one.Tool)
            .WithMany()
            .HasForeignKey(fKey => fKey.ToolId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure One-to-One relationship between Notification and WorkspaceUser
        modelBuilder.Entity<Notification>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Notification>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Flow and WorkspaceUser
        modelBuilder.Entity<Flow>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Flow>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between SupportTicket and WorkspaceUser
        modelBuilder.Entity<SupportTicket>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<SupportTicket>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Ticket and WorkspaceUser
        modelBuilder.Entity<Ticket>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Ticket>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many relationship between FlowVersion and TriggerFlowVersions (@rahmat, Validate)
        modelBuilder.Entity<TimeTriggersFlowVersion>().HasOne(one => one.Trigger).WithMany(many => many.TimeTriggerFlowVersions).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired().OnDelete(DeleteBehavior.Cascade); ;

        // Configure One-to-Many relationship between TimeTriggersFlowVersion and Trigger (@rahmat, Validate)
        modelBuilder.Entity<TimeTriggersFlowVersion>().HasOne(one => one.Trigger).WithMany(many => many.TimeTriggerFlowVersions).HasForeignKey(fKey => fKey.TriggerId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FlowVersionHistory>().HasOne(one => one.FlowVersion).WithMany(many => many.FlowVersionHistories).HasForeignKey(fKey => fKey.FlowVersionId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FlowVersionUser>().HasOne(one => one.FlowVersion).WithMany(many => many.FlowVersionUsers).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Conversation>().HasOne(one => one.FlowVersion).WithMany(many => many.Conversations).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired().OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ConversationMessage>().HasOne(one => one.Conversation).WithMany(many => many.Messages).HasForeignKey(fKey => fKey.ConversationId).IsRequired().OnDelete(DeleteBehavior.Cascade);

        // Configure One-to-Many relationship between Job and JobNodeExecutionLog
        modelBuilder.Entity<JobNodeExecutionLog>()
            .HasOne(one => one.Job)
            .WithMany(many => many.NodeExecutionLogs)
            .HasForeignKey(fKey => fKey.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for ws_NodeExecutionLogs
        modelBuilder.Entity<JobNodeExecutionLog>()
            .HasIndex(index => new { index.TenantId, index.JobId, index.NodeId, index.NodeExecutionId, index.RetryAttempt });

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
                    // Only stamp the tenant when it has not already been set explicitly.
                    // The Super Admin notification flow pre-sets TenantId per target tenant
                    // so a single notification can be delivered across multiple tenants.
                    if (entry.Entity.TenantId == Guid.Empty)
                        entry.Entity.TenantId = CurrentTenantId;
                    break;
            }
        }

        // Auto-stamp SpaceId on newly added entities that have a SpaceId property.
        // When in a specific space (not Central), new records are assigned to that space.
        if (CurrentSpaceId != Guid.Empty)
        {
            foreach (var entry in ChangeTracker.Entries().ToList())
            {
                if (entry.State == EntityState.Added)
                {
                    var spaceIdProp = entry.Entity.GetType().GetProperty("SpaceId");
                    if (spaceIdProp != null && spaceIdProp.PropertyType == typeof(Guid?))
                    {
                        spaceIdProp.SetValue(entry.Entity, CurrentSpaceId);
                    }
                }
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
                    // Only stamp the tenant when it has not already been set explicitly.
                    // The Super Admin notification flow pre-sets TenantId per target tenant
                    // so a single notification can be delivered across multiple tenants.
                    if (entry.Entity.TenantId == Guid.Empty)
                        entry.Entity.TenantId = CurrentTenantId;
                    break;
            }
        }

        // Auto-stamp SpaceId on newly added entities that have a SpaceId property.
        // When in a specific space (not Central), new records are assigned to that space.
        if (CurrentSpaceId != Guid.Empty)
        {
            foreach (var entry in ChangeTracker.Entries().ToList())
            {
                if (entry.State == EntityState.Added)
                {
                    var spaceIdProp = entry.Entity.GetType().GetProperty("SpaceId");
                    if (spaceIdProp != null && spaceIdProp.PropertyType == typeof(Guid?))
                    {
                        spaceIdProp.SetValue(entry.Entity, CurrentSpaceId);
                    }
                }
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
    public DbSet<Machine> Machines { get; set; }
    public DbSet<ProjectTemplate> ProjectTemplates { get; set; }
    public DbSet<TemplateResource> TemplateResources { get; set; }
    public DbSet<FlowVersion> FlowVersions { get; set; }
    public DbSet<FlowVersionUser> FlowVersionUsers { get; set; }
    public DbSet<FlowVersionHistory> FlowVersionHistories { get; set; }
    public DbSet<AgentRiskRegistry> AgentRiskRegistries { get; set; }
    public DbSet<Queue> Queues { get; set; }
    public DbSet<QueueTransaction> QueueTransactions { get; set; }
    public DbSet<QueueTransactionEvent> QueueTransactionEvents { get; set; }
    public DbSet<QueueUser> QueueUsers { get; set; }
    public DbSet<Job> Jobs { get; set; }
    public DbSet<JobNodeExecutionLog> JobNodeExecutionLogs { get; set; }
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
    public DbSet<TenantModelProvider> TenantModelProviders { get; set; }
    public DbSet<VectorStore> VectorStores { get; set; }
    public DbSet<KnowledgeBase> KnowledgeBases { get; set; }
    public DbSet<KnowledgeBaseFile> KnowledgeBaseFiles { get; set; }
    public DbSet<ApiKey> ApiKeys { get; set; }
    public DbSet<ResourceShare> ResourceShares { get; set; }
    public DbSet<Skill> Skills { get; set; }
    public DbSet<SkillFile> SkillFiles { get; set; }
    public DbSet<Tool> Tools { get; set; }
    public DbSet<FlowVersion_Tool> FlowVersionTools { get; set; }
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<TicketComment> TicketComments { get; set; }
    public DbSet<TicketAttachment> TicketAttachments { get; set; }
    public DbSet<TicketHistory> TicketHistories { get; set; }
}