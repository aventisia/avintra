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
        // Gloabl TenantId filters
        modelBuilder.Entity<MLModel>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ExtractedData>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<DataField>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<UploadedDoc>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<ExtractionSetup>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<FieldSetup>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TableMetadata>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<TableHeader>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

        // Unique property
        modelBuilder.Entity<MLModel>().HasIndex(index => new { index.Name, index.CreatedByUserId }).IsUnique();
        modelBuilder.Entity<DataField>().HasIndex(index => new { index.MLModelId, index.Name }).IsUnique();

        // Enum to string conversion
        modelBuilder.Entity<MLModel>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ModelTypesEnum>());
        modelBuilder.Entity<MLModel>().Property(e => e.Status).HasConversion(new EnumToStringConverter<ModelStatusEnum>());
        modelBuilder.Entity<DataField>().Property(e => e.Type).HasConversion(new EnumToStringConverter<FieldTypesEnum>());
        modelBuilder.Entity<UploadedDoc>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ExtractedDataType>());
        modelBuilder.Entity<ExtractedData>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ExtractedDataType>());

        // Configure One-to-One relationship between Model Library and ModelBuilder User
        modelBuilder.Entity<MLModel>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MLModel>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<ExtractedData>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ExtractedData>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<DataField>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<DataField>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<UploadedDoc>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<UploadedDoc>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<LLM>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<LLM>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Extraction Setup and ModelBuilder User
        modelBuilder.Entity<ExtractionSetup>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ExtractionSetup>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-Many relationship between data model and model library
        modelBuilder.Entity<MLModel>().HasMany(many => many.ExtractedData).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.DataFields).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.UploadedDocs).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.ExtractionSetups).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();

        // Configure One-to-One relationship between Uploaded doc and extracted data
        modelBuilder.Entity<UploadedDoc>().HasOne(one => one.ExtractedData).WithOne(one => one.UploadedDoc).HasForeignKey<ExtractedData>(fKey => fKey.DocId).OnDelete(DeleteBehavior.Restrict);

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
    public DbSet<DataField> DataFields { get; set; }
    public DbSet<UploadedDoc> UploadedDocs { get; set; }
    public DbSet<LLM> LLMs { get; set; }
    public DbSet<ExtractionSetup> ExtractionSetups { get; set; }
    public DbSet<TableMetadata> TableMetadata { get; set; }
    public DbSet<TableHeader> TableHeaders { get; set; }
    public DbSet<FieldSetup> FieldSetups { get; set; }
}