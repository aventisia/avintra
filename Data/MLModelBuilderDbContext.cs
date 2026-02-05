/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

namespace MLModelBuilderAPIs.Data;

public class MLModelBuilderDbContext : DbContext
{
    private readonly ICurrentTenantService _currentTenantService;
    private Guid CurrentTenantId { get; set; }

    public MLModelBuilderDbContext(ICurrentTenantService currentTenantService,
        DbContextOptions<MLModelBuilderDbContext> options
        ) : base(options)
    {
        _currentTenantService = currentTenantService;
        CurrentTenantId = _currentTenantService.CurrentTenantId;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Global TenantId filters
        modelBuilder.Entity<AIProject>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<AIProjectVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<VersionTask>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ExtractedData>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<AIProject_User>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<AIProjectVersionApiKey>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<MLModelTemplate>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ConversationHistory>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ConversationalModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<GenerativeModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ScheduledModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FineTuningLog>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        // Test_Azure: Need to remove after testing
        if (CurrentTenantId != Guid.Empty)
        {
            modelBuilder.Entity<VersionResource>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        }

        // Unique property
        modelBuilder.Entity<AIProject>().HasIndex(index => new { index.Name, index.CreatedByUserId }).IsUnique();

        // Enum to string conversion
        modelBuilder.Entity<AIProject>().Property(e => e.Type).HasConversion(new EnumToStringConverter<AIProjectTypeEnum>());
        modelBuilder.Entity<ScheduledModel>().Property(e => e.ScheduleType).HasConversion(new EnumToStringConverter<ModelOperationTypesEnum>());
        modelBuilder.Entity<ScheduledModel>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ScheduleTypesEnum>());
        modelBuilder.Entity<FineTuningLog>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ScheduleTypesEnum>());
        modelBuilder.Entity<MLModelTemplate>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<AccessTypesEnum>());
        modelBuilder.Entity<MLModelTemplate>().Property(e => e.Type).HasConversion(new EnumToStringConverter<AIProjectTypeEnum>());
        modelBuilder.Entity<AIProject_User>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<ProjectUserAccessEnum>());
        modelBuilder.Entity<ConversationalModel>().Property(e => e.ConfigurationType).HasConversion(new EnumToStringConverter<LLMConfigurationTypesEnum>());
        modelBuilder.Entity<GenerativeModel>().Property(e => e.ConfigurationType).HasConversion(new EnumToStringConverter<LLMConfigurationTypesEnum>());
        modelBuilder.Entity<GenerativeModel>().Property(e => e.Name).HasConversion(new EnumToStringConverter<GenerativeModelTypesEnum>());
        modelBuilder.Entity<ConversationHistory>().Property(e => e.ParticipantType).HasConversion(new EnumToStringConverter<ParticipantTypesEnum>());

        // Configure One-to-One relationship between Model Library and ModelBuilder User
        modelBuilder.Entity<AIProject>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AIProject>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<ExtractedData>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ExtractedData>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<VersionResource>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<VersionResource>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Uploaded doc and extracted data
        modelBuilder.Entity<VersionResource>().HasMany(many => many.ExtractedDatas).WithOne(one => one.VersionResource).HasForeignKey(fKey => fKey.VersionResourceId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Schedule Model and ModelBuilder User
        modelBuilder.Entity<ScheduledModel>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ScheduledModel>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many relationship between Schedule Model and fine tuning log
        modelBuilder.Entity<ScheduledModel>().HasMany(many => many.FineTuningLogs).WithOne(one => one.ScheduledModel).HasForeignKey(fKey => fKey.ScheduledModelId).IsRequired();

        modelBuilder.Entity<ScheduledModel>().HasOne(u => u.ExtractedData).WithMany(t => t.ScheduledModels).HasForeignKey(u => u.ExtractedDataId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<FineTuningLog>().HasOne(u => u.ScheduledModel).WithMany(t => t.FineTuningLogs).HasForeignKey(u => u.ScheduledModelId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<VersionTask>().HasOne(u => u.AIProjectVersion).WithMany(t => t.Tasks).HasForeignKey(u => u.AIProjectVersionId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<VersionResource>().HasOne(u => u.AIProjectVersion).WithMany(t => t.Resources).HasForeignKey(u => u.AIProjectVersionId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<AIProject_User>().HasOne(u => u.AIProject).WithMany(t => t.ProjectUsers).HasForeignKey(u => u.AIProjectId).OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
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

    //Db Sets
    public DbSet<AIProject> AIProjects { get; set; }
    public DbSet<AIProjectVersion> AIProjectVersions { get; set; }
    public DbSet<VersionTask> VersionTasks { get; set; }
    public DbSet<VersionResource> VersionResources { get; set; }
    public DbSet<ExtractedData> ExtractedData { get; set; }
    public DbSet<AIProject_User> AIProject_Users { get; set; }
    public DbSet<GenerativeModel> GenerativeModels { get; set; }
    public DbSet<AIProjectVersionApiKey> AIProjectVersionApiKeys { get; set; }
    public DbSet<ScheduledModel> ScheduledModels { get; set; }
    public DbSet<FineTuningLog> FineTuningLogs { get; set; }
    public DbSet<ConversationalModel> ConversationalModels { get; set; }
    public DbSet<MLModelTemplate> MLModelTemplates { get; set; }
    public DbSet<ConversationHistory> ConversationHistories { get; set; }
}