/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

using Org.BouncyCastle.Bcpg;

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
        modelBuilder.Entity<MLModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ExtractedData>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<UploadedDoc>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ScheduledModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FineTuningLog>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ModelAPIKey>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ModelTask>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ConversationalModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<MLModelVersion>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<MLModelTemplate>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<MLModelUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

        // Unique property
        modelBuilder.Entity<MLModel>().HasIndex(index => new { index.Name, index.CreatedByUserId }).IsUnique();

        // Enum to string conversion
        modelBuilder.Entity<MLModel>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ModelTypesEnum>());
        modelBuilder.Entity<MLModel>().Property(e => e.SetupStatus).HasConversion(new EnumToStringConverter<SetupStatusTypesEnum>());
        modelBuilder.Entity<UploadedDoc>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ExtractedDataType>());
        modelBuilder.Entity<UploadedDoc>().Property(e => e.Stage).HasConversion(new EnumToStringConverter<DocumentStageTypesEnum>());
        modelBuilder.Entity<ExtractedData>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ExtractedDataType>());
        modelBuilder.Entity<ScheduledModel>().Property(e => e.ScheduleType).HasConversion(new EnumToStringConverter<ModelOperationTypesEnum>());
        modelBuilder.Entity<ScheduledModel>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ScheduleTypesEnum>());
        modelBuilder.Entity<FineTuningLog>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ScheduleTypesEnum>());
        modelBuilder.Entity<MLModelTemplate>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<AccessTypesEnum>());
        modelBuilder.Entity<MLModelUser>().Property(e => e.AccessType).HasConversion(new EnumToStringConverter<AgentAccessTypesEnum>());
        modelBuilder.Entity<ModelTask>().Property(e => e.ConfigurationType).HasConversion(new EnumToStringConverter<LLMConfigurationTypesEnum>());
        modelBuilder.Entity<ConversationalModel>().Property(e => e.ConfigurationType).HasConversion(new EnumToStringConverter<SpeechConfigurationTypesEnum>());
        modelBuilder.Entity<ConversationalModel>().Property(e => e.SpeechConfigurationType).HasConversion(new EnumToStringConverter<LLMConfigurationTypesEnum>());

        // Configure One-to-One relationship between Model Library and ModelBuilder User
        modelBuilder.Entity<MLModel>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MLModel>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<ExtractedData>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ExtractedData>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<UploadedDoc>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<UploadedDoc>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many relationship between data model and model library
        modelBuilder.Entity<MLModel>().HasMany(many => many.ExtractedData).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.UploadedDocs).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.ScheduledModels).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.Tasks).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.ConversationalModels).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();

        // Configure One-to-One relationship between Uploaded doc and extracted data
        modelBuilder.Entity<UploadedDoc>().HasMany(many => many.ExtractedDatas).WithOne(one => one.UploadedDoc).HasForeignKey(fKey => fKey.DocId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Schedule Model and ModelBuilder User
        modelBuilder.Entity<ScheduledModel>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ScheduledModel>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many relationship between Schedule Model and fine tuning log
        modelBuilder.Entity<ScheduledModel>().HasMany(many => many.FineTuningLogs).WithOne(one => one.ScheduledModel).HasForeignKey(fKey => fKey.ScheduledModelId).IsRequired();

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
    public DbSet<MLModel> MLModels { get; set; }
    public DbSet<ExtractedData> ExtractedData { get; set; }
    public DbSet<UploadedDoc> UploadedDocs { get; set; }
    public DbSet<ScheduledModel> ScheduledModels { get; set; }
    public DbSet<FineTuningLog> FineTuningLogs { get; set; }
    public DbSet<ModelAPIKey> ModelAPIKeys { get; set; }
    public DbSet<ModelTask> ModelTasks { get; set; }
    public DbSet<ConversationalModel> ConversationalModels { get; set; }
    public DbSet<MLModelVersion> MLModelVersions { get; set; }
    public DbSet<MLModelTemplate> MLModelTemplates { get; set; }
    public DbSet<MLModelUser> MLModelUsers { get; set; }
}