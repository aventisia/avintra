/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace AccountsAPIs.Data;

public partial class AccountsDbContext : IdentityDbContext<
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
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid CurrentTenantId { get; set; }
    private Guid CurrentUserId { get; set; }

    public AccountsDbContext(
        ICurrentTenantService currentTenantService,
        IHttpContextAccessor httpContextAccessor,
        DbContextOptions<AccountsDbContext> options) : base(options)
    {
        _currentTenantService = currentTenantService;
        CurrentTenantId = _currentTenantService.CurrentTenantId;
        _httpContextAccessor = httpContextAccessor;

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Global TenantId filters
        builder.Entity<Subscription>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        builder.Entity<BillingAccount>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        builder.Entity<Invoice>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        builder.Entity<Payment>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        builder.Entity<AppIntegration>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        builder.Entity<AppSecret>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        builder.Entity<TenantSubscription>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        builder.Entity<CreditUsage>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);

        // Unique property
        builder.Entity<AccountUser>().HasIndex(index => index.UserName).IsUnique();
        builder.Entity<Tenant>().HasIndex(index => index.Name).IsUnique();

        // Enum to string conversion
        builder.Entity<Tenant>().Property(e => e.DbOption).HasConversion(new EnumToStringConverter<DatabaseOptionsEnum>());
        builder.Entity<Tenant>().Property(e => e.Currency).HasConversion(new EnumToStringConverter<CurrencyTypesEnum>());
        builder.Entity<SessionLog>().Property(e => e.HowSessionEnded).HasConversion(new EnumToStringConverter<TerminateSessionReasonsEnum>());
        builder.Entity<VerificationCode>().Property(e => e.RequestType).HasConversion(new EnumToStringConverter<VerificationCodeRequestTypesEnum>());
        builder.Entity<PlanPricing>().Property(e => e.Currency).HasConversion(new EnumToStringConverter<CurrencyTypesEnum>());
        builder.Entity<PlanPricing>().Property(e => e.Unit).HasConversion(new EnumToStringConverter<UnitTypesEnum>());
        builder.Entity<PlanPricing>().Property(e => e.Frequency).HasConversion(new EnumToStringConverter<FrequencyTypesEnum>());
        builder.Entity<PlanPricing>().Property(e => e.TenantType).HasConversion(new EnumToStringConverter<TenantTypesEnum>());
        builder.Entity<PlanPricing>().Property(e => e.PricingComponent).HasConversion(new EnumToStringConverter<PricingComponentsEnum>());
        builder.Entity<Payment>().Property(e => e.PaymentStatus).HasConversion(new EnumToStringConverter<PaymentStatusEnum>());
        builder.Entity<Payment>().Property(e => e.PaymentMethod).HasConversion(new EnumToStringConverter<PaymentMethodEnum>());
        builder.Entity<AccountUser>().Property(e => e.Gender).HasConversion(new EnumToStringConverter<GenderTypeEnum>());
        builder.Entity<Address>().Property(e => e.AddressType).HasConversion(new EnumToStringConverter<AddressTypeEnum>());
        builder.Entity<RolePermission>().Property(e => e.Access).HasConversion(new EnumToStringConverter<PermissionAccessTypesEnum>());
        builder.Entity<AppSecret>().Property(e => e.Type).HasConversion(new EnumToStringConverter<AppSecretTypesEnum>());
        builder.Entity<CreditPlan>().Property(e => e.ServiceType).HasConversion(new EnumToStringConverter<CreditServiceTypesEnum>());
        builder.Entity<CreditPlan>().Property(e => e.UnitType).HasConversion(new EnumToStringConverter<UnitTypesEnum>());
        builder.Entity<CreditUsage>().Property(e => e.ServiceType).HasConversion(new EnumToStringConverter<CreditServiceTypesEnum>());

        // Configure One-to-One relationship between AccountUser and AccountUser
        builder.Entity<AccountUser>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<AccountUser>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between AccountRole and AccountUser
        builder.Entity<AccountRole>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<AccountRole>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Tenant and AccountUser
        builder.Entity<Tenant>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Tenant>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        //Configure one-to-many relationship between Plan and Subscription
        builder.Entity<PlanPricing>().HasMany(p => p.Subscriptions).WithOne(one => one.PlanPricing).HasForeignKey(fKey => fKey.PlanId).IsRequired();

        // Configure Many-to-Many relationship between Permission and Custom Role
        builder.Entity<RolePermission>().HasOne(o => o.Permission).WithMany(r => r.RolePermissions).HasForeignKey(fKey => fKey.PermissionId).IsRequired();
        builder.Entity<RolePermission>().HasOne(o => o.AccountRole).WithMany(r => r.RolePermissions).HasForeignKey(fKey => fKey.AccountRoleId).IsRequired();

        // Configure Many-to-Many relationship between AccountUser and AccountRole
        builder.Entity<AccountUser>().HasMany(m => m.UserRoles).WithOne(o => o.User).HasForeignKey(fKey => fKey.UserId).IsRequired();
        builder.Entity<AccountRole>().HasMany(m => m.UserRoles).WithOne(o => o.Role).HasForeignKey(fKey => fKey.RoleId).IsRequired();

        // Configure one-to-many relationship between Invoice and payment
        builder.Entity<Invoice>().HasMany(i => i.Payment).WithOne(p => p.Invoice).HasForeignKey(p => p.InvoiceId);

        // Configure One-to-One relationship between BillingAccount and AccountUser
        builder.Entity<BillingAccount>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<BillingAccount>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

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

        var auditEntries = new List<AuditLog>();

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added || entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
            {
                var auditEntry = new AuditLog
                {
                    UserId = CurrentUserId, // Fetch the current user's ID
                    EntityName = entry.Entity.GetType().Name,
                    EntityId = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey())?.CurrentValue as Guid? ?? Guid.Empty,
                    Action = entry.State.ToString(),
                    Changes = GetChanges(entry),
                    Timestamp = DateTime.UtcNow
                };

                auditEntries.Add(auditEntry);
            }

            AuditLogs.AddRange(auditEntries);

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
        //Collect audit log entries
        var auditEntries = new List<AuditLog>();
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added || entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
            {
                var auditEntry = new AuditLog
                {
                    UserId = CurrentUserId,
                    EntityName = entry.Entity.GetType().Name,
                    EntityId = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey())?.CurrentValue as Guid? ?? Guid.Empty,
                    Action = entry.State.ToString(),
                    Changes = GetChanges(entry),
                    Timestamp = DateTime.UtcNow
                };

                auditEntries.Add(auditEntry);
            }
        }

        // Add the audit log entries to the DbContext
        AuditLogs.AddRange(auditEntries);

        // Call base SaveChangesAsync
        var result = await base.SaveChangesAsync(cancellationToken);
        return result;
    }

    private static string? GetChanges(EntityEntry entry) => entry.State switch
    {
        EntityState.Added => JsonSerializer.Serialize(entry.CurrentValues.Properties.ToDictionary(p => p.Name, p => entry.CurrentValues[p])),
        EntityState.Deleted => JsonSerializer.Serialize(entry.OriginalValues.Properties.ToDictionary(p => p.Name, p => entry.OriginalValues[p])),
        EntityState.Modified => JsonSerializer.Serialize(entry.Properties.Where(p => p.IsModified)
        .ToDictionary(k => k.Metadata.Name, v => new { NewValue = v.CurrentValue, OldValue = v.OriginalValue })),
        _ => null
    };
}