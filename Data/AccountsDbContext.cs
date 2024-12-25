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
        modelBuilder.Entity<Subscription>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Invoice>().HasQueryFilter(qf => qf.TenantId ==  CurrentTenantId);
        modelBuilder.Entity<Payment>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        modelBuilder.Entity<Plan>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        // Unique property
        modelBuilder.Entity<AccountUser>().HasIndex(index => index.UserName).IsUnique();
        modelBuilder.Entity<Tenant>().HasIndex(index => index.Name).IsUnique();

        // Enum to string conversion
        modelBuilder.Entity<Tenant>().Property(e => e.DbOption).HasConversion(new EnumToStringConverter<DatabaseOptionsEnum>());
        modelBuilder.Entity<SessionLog>().Property(e => e.HowSessionEnded).HasConversion(new EnumToStringConverter<TerminateSessionReasonsEnum>());
        modelBuilder.Entity<VerificationCode>().Property(e => e.RequestType).HasConversion(new EnumToStringConverter<VerificationCodeRequestTypesEnum>());

        // Configure One-to-One relationship between AccountUser and AccountUser
        modelBuilder.Entity<AccountUser>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AccountUser>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Tenant and AccountUser
        modelBuilder.Entity<Tenant>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Tenant>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);
        
        // Configure Many-to-Many relationship between AccountUser and AccountRole
        modelBuilder.Entity<AccountUser>().HasMany(m => m.UserRoles).WithOne(o => o.User).HasForeignKey(fKey => fKey.UserId).IsRequired();
        modelBuilder.Entity<AccountRole>().HasMany(m => m.UserRoles).WithOne(o => o.Role).HasForeignKey(fKey => fKey.RoleId).IsRequired();

        //Configure one-to-many relationship between Plan and Subscription
        modelBuilder.Entity<Plan>().HasMany(p => p.Subscriptions).WithOne(one => one.Plan).HasForeignKey(fKey => fKey.PlanId).IsRequired();

        // Configure one-to-many relationship between Subscription and Invoice
        modelBuilder.Entity<Subscription>().HasMany(i => i.Invoice).WithOne(s => s.Subscription).HasForeignKey(fKey => fKey.SubscriptionId).IsRequired();
       
        // Configure one-to-many relationship between Invoice and payment
        modelBuilder.Entity<Invoice>().HasMany(i => i.Payment).WithOne(p => p.Invoice).HasForeignKey(p => p.InvoiceId);
    
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
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<ActiveSession> ActiveSessions { get; set; }
    public DbSet<SessionLog> SessionLogs { get; set; }
    public DbSet<ObsoletePwd> ObsoletePwds { get; set; }
    public DbSet<VerificationCode> VerificationCodes { get; set; }

    public DbSet<Plan> Plans { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<CustomRole> CustomRoles { get; set; }
    public DbSet<Invoice> Invoices{ get; set; }
    public DbSet<Payment> Payments { get; set; }

}