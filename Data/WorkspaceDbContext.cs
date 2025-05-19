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
        modelBuilder.Entity<WorkspaceUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Notification>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<NotificationUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Flow>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowComment>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<SupportTicket>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<SupportTicketRemark>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowLog>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Machine>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<MachineFlow>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

        modelBuilder.Entity<FlowTemplate>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Plan>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Subscription>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FlowExecutionLog>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ActionExecutionLog>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Queue>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<QueueFlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<QueueTransaction>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Job>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<KeyStore>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Vault>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

        modelBuilder.Entity<Triggers>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TriggersFlowVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

        // Unique property
        modelBuilder.Entity<WorkspaceUser>().HasIndex(index => index.UserName).IsUnique();
        modelBuilder.Entity<Flow>().HasIndex(index => new { index.CreatedByUserId, index.Name }).IsUnique();
        modelBuilder.Entity<SupportTicket>().HasIndex(index => index.TicketNumber).IsUnique();


        // Enum to string conversion
        modelBuilder.Entity<Notification>().Property(e => e.Type).HasConversion(new EnumToStringConverter<NotificationTypesEnum>());
        modelBuilder.Entity<Flow>().Property(e => e.Type).HasConversion(new EnumToStringConverter<FlowTypesEnum>());
        modelBuilder.Entity<FlowLog>().Property(e => e.Status).HasConversion(new EnumToStringConverter<FlowLogStatusEnum>());
        modelBuilder.Entity<FlowTemplate>().Property(e => e.Type).HasConversion(new EnumToStringConverter<CategoryTypesEnum>());
        modelBuilder.Entity<Machine>().Property(e => e.Type).HasConversion(new EnumToStringConverter<MachineTypeEnum>());
        modelBuilder.Entity<Machine>().Property(e => e.Status).HasConversion(new EnumToStringConverter<MachineStatusTypeEnum>());
        modelBuilder.Entity<Machine>().Property(e => e.Environment).HasConversion(new EnumToStringConverter<EnvironmentTypesEnum>());
        modelBuilder.Entity<QueueTransaction>().Property(e => e.Status).HasConversion(new EnumToStringConverter<QueueTransactionStatusTypesEnum>());
        modelBuilder.Entity<KeyStore>().Property(e => e.Type).HasConversion(new EnumToStringConverter<KeyStoreTypesEnum>());
        modelBuilder.Entity<KeyStore>().Property(e => e.AccessLevel).HasConversion(new EnumToStringConverter<AccessLevelTypesEnum>());
        modelBuilder.Entity<Triggers>().Property(e => e.Environment).HasConversion(new EnumToStringConverter<EnvironmentTypesEnum>());
        modelBuilder.Entity<Triggers>().Property(e => e.Frequency).HasConversion(new EnumToStringConverter<TriggerFrequencyTypesEnum>());

        modelBuilder.Entity<Triggers>().Property(e => e.RepeateOn).HasColumnType("TEXT[]");
        modelBuilder.Entity<Triggers>().Property(e => e.NonWorkingDays).HasColumnType("TIMESTAMP[]").HasConversion(v => v, v => v);

        // Configure One-to-One relationship between Notification and WorkspaceUser
        modelBuilder.Entity<Notification>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Notification>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Flow and WorkspaceUser
        modelBuilder.Entity<Flow>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Flow>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure Many-to-Many relationship between User and Notification
        modelBuilder.Entity<WorkspaceUser>().HasMany(many => many.NotificationUsers).WithOne(one => one.User).HasForeignKey(fKey => fKey.UserId).IsRequired();
        modelBuilder.Entity<Notification>().HasMany(many => many.NotificationUsers).WithOne(one => one.Notification).HasForeignKey(fKey => fKey.NotificationId).IsRequired();

        // Configure Many-to-Many relationship between Machine and flow
        modelBuilder.Entity<Machine>().HasMany(many => many.MachineFlows).WithOne(one => one.Machine).HasForeignKey(fKey => fKey.MachineId).IsRequired();
        modelBuilder.Entity<FlowVersion>().HasMany(many => many.MachineFlows).WithOne(one => one.FlowVersion).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired();

        // Configure One-to-One relationship between SupportTicket and WorkspaceUser
        modelBuilder.Entity<SupportTicket>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<SupportTicket>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many relationship between FlowLog and flow
        modelBuilder.Entity<Flow>().HasMany(many => many.FlowLog).WithOne(one => one.Flow).HasForeignKey(fKey => fKey.FlowId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many Relationship between Flow and FlowTemplate
        modelBuilder.Entity<Flow>().HasMany(many => many.FlowTemplate).WithOne(one => one.Flow).HasForeignKey(f => f.FlowId).IsRequired();


        //Configure one-to-many relationship between Flow and Flow version
        modelBuilder.Entity<Flow>().HasMany(f => f.FlowVersions).WithOne(one => one.Flow).HasForeignKey(fKey => fKey.FlowId).IsRequired();

        //Configure one-to-many relationship between Plan and Subscription
        modelBuilder.Entity<Plan>().HasMany(f => f.Subscriptions).WithOne(one => one.Plan).HasForeignKey(fKey => fKey.PlanId).IsRequired();

        //Configure one-to-many relationship between Flow and Flow Execution Log
        modelBuilder.Entity<Flow>().HasMany(f => f.FlowExecutionLogs).WithOne(one => one.Flow).HasForeignKey(fKey => fKey.FlowId).IsRequired();

        // Configure one-to-many relationship between Flow Execution Log and Action Execution Log
        modelBuilder.Entity<FlowExecutionLog>().HasMany(f => f.ActionExecutionLogs).WithOne(one => one.FlowExecutionLog).HasForeignKey(fKey => fKey.FlowExecutionLogId).IsRequired();

        // Configure Many-to-Many relationship between Queue and QueueTransaction
        modelBuilder.Entity<Queue>().HasMany(many => many.QueueTransactions).WithOne(one => one.Queue).HasForeignKey(fKey => fKey.QueueId).IsRequired();

        // Configure Many-to-Many relationship between Job and Flow Version
        modelBuilder.Entity<FlowVersion>().HasMany(many => many.Jobs).WithOne(one => one.FlowVersion).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired();

        // Configure Many-to-Many relationship between queue and flow version
        modelBuilder.Entity<Queue>().HasMany(many => many.QueueFlowVersions).WithOne(one => one.Queue).HasForeignKey(fKey => fKey.QueueId).IsRequired();
        modelBuilder.Entity<FlowVersion>().HasMany(many => many.QueueFlowVersions).WithOne(one => one.FlowVersion).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired();

        // Configure Many-to-Many relationship between trigger and flow version
        modelBuilder.Entity<Triggers>().HasMany(many => many.TriggerFlowVersions).WithOne(one => one.Trigger).HasForeignKey(fKey => fKey.TriggerId).IsRequired();
        modelBuilder.Entity<FlowVersion>().HasMany(many => many.TriggerFlowVersions).WithOne(one => one.FlowVersion).HasForeignKey(fKey => fKey.FlowVersionId).IsRequired();

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

    public DbSet<FlowTemplate> FlowTemplates { get; set; }
    public DbSet<FlowVersion> FlowVersions { get; set; }
    public DbSet<Plan> Plans { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<FlowExecutionLog> FlowExecutionLogs { get; set; }
    public DbSet<ActionExecutionLog> ActionExecutionLogs { get; set; }
    public DbSet<Queue> Queues { get; set; }
    public DbSet<QueueTransaction> QueueTransactions { get; set; }
    public DbSet<Job> Jobs { get; set; }
    public DbSet<KeyStore> KeyStores { get; set; }
    public DbSet<Vault> Vaults { get; set; }
}