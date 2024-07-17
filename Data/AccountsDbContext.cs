/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

namespace AccountsAPIs.Data;

public class AccountsDbContext : IdentityDbContext<
        AccountUser,
        AccountRole,
        Guid,
        IdentityUserClaim<Guid>,
        AccountUserRole,
        IdentityUserLogin<Guid>,
        IdentityRoleClaim<Guid>,
        IdentityUserToken<Guid>>
{
    private readonly ICurrentTenantService _currentTenantService;
    private Guid CurrentTenantId { get; set; }

    public AccountsDbContext(
        ICurrentTenantService currentTenantService,
        DbContextOptions<AccountsDbContext> options) : base(options)
    {
        _currentTenantService = currentTenantService;
        CurrentTenantId = _currentTenantService.CurrentTenantId;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Gloabl TenantId filters
        modelBuilder.Entity<AccountUser>().HasIndex(index => index.UserName).IsUnique();

        // Unique property

        // Enum to string conversion

        // Configure One-to-One relationship between AccountUser and AccountUser
        modelBuilder.Entity<AccountUser>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AccountUser>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure Many-to-Many relationship between AccountUser and AccountRole
        modelBuilder.Entity<AccountUser>().HasMany(m => m.UserRoles).WithOne(o => o.User).HasForeignKey(fKey => fKey.UserId).IsRequired();
        modelBuilder.Entity<AccountRole>().HasMany(m => m.UserRoles).WithOne(o => o.Role).HasForeignKey(fKey => fKey.RoleId).IsRequired();
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

    public override DbSet<AccountRole> Roles { get; set; }
    public override DbSet<AccountUser> Users { get; set; }
    public override DbSet<AccountUserRole> UserRoles { get; set; }
}