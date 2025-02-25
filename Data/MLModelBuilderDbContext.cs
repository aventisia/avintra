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
        modelBuilder.Entity<AnnotationData>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

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

        // Configure One-to-Many relationship between data model and model library
        modelBuilder.Entity<MLModel>().HasMany(many => many.ExtractedData).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.DataFields).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.UploadedDocs).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();
        modelBuilder.Entity<MLModel>().HasMany(many => many.AnnotationData).WithOne(one => one.MLModel).HasForeignKey(fKey => fKey.MLModelId).IsRequired();

        // Configure One-to-One relationship between Data Model and ModelBuilder User
        modelBuilder.Entity<AnnotationData>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AnnotationData>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Uploaded doc and Annotation data
        modelBuilder.Entity<UploadedDoc>().HasOne(one => one.AnnotationData).WithOne(one => one.UploadedDoc).HasForeignKey<AnnotationData>(fKey => fKey.UploadedDocId).OnDelete(DeleteBehavior.Restrict);
        
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
    public DbSet<AnnotationData> AnnotationData { get; set; }

}