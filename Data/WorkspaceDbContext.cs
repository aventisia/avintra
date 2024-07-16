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

        // Gloabl TenantId filters
        modelBuilder.Entity<WorkspaceUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Project>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Notification>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<NotificationUser>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Flow>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        
        // Unique property
        modelBuilder.Entity<WorkspaceUser>().HasIndex(index => index.UserName).IsUnique();
        modelBuilder.Entity<Project>().HasIndex(index => index.Name).IsUnique();
        modelBuilder.Entity<Flow>().HasIndex(index => new { index.ProjectId, index.Name }).IsUnique();

        // Enum to string conversion
        modelBuilder.Entity<Project>().Property(e => e.Type).HasConversion(new EnumToStringConverter<ProjectTypesEnum>());
        modelBuilder.Entity<Notification>().Property(e => e.Type).HasConversion(new EnumToStringConverter<NotificationTypesEnum>());
        modelBuilder.Entity<Flow>().Property(e => e.Type).HasConversion(new EnumToStringConverter<FlowTypesEnum>());

        // Configure One-to-One relationship between Project and WorkspaceUser
        modelBuilder.Entity<Project>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Project>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);
        
        // Configure One-to-One relationship between Notification and WorkspaceUser
        modelBuilder.Entity<Notification>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Notification>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Flow and WorkspaceUser
        modelBuilder.Entity<Flow>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Flow>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure Many-to-Many relationship between User and Notification
        modelBuilder.Entity<WorkspaceUser>().HasMany(many => many.NotificationUsers).WithOne(one => one.User).HasForeignKey(fKey => fKey.UserId).IsRequired();
        modelBuilder.Entity<Notification>().HasMany(many => many.NotificationUsers).WithOne(one => one.Notification).HasForeignKey(fKey => fKey.NotificationId).IsRequired();
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
    public DbSet<Project> Projects { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<NotificationUser> NotificationUsers { get; set; }
    public DbSet<Flow> Flows { get; set; }
}