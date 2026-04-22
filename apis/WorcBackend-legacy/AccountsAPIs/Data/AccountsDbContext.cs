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
        builder.Entity<AppIntegration>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        builder.Entity<CreditUsage>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        if (CurrentTenantId != Guid.Empty)
        {
            builder.Entity<BillingDetail>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
            builder.Entity<BillingHistory>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
            builder.Entity<TenantSubscription>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
            builder.Entity<PaymentHistory>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
            builder.Entity<PaymentMethod>().HasQueryFilter(qf => qf.TenantId == CurrentTenantId);
        }

        // Unique property
        builder.Entity<AccountUser>().HasIndex(index => index.UserName).IsUnique();
        builder.Entity<Tenant>().HasIndex(index => index.Name).IsUnique();

        // Enum to string conversion
        builder.Entity<Tenant>().Property(e => e.DbOption).HasConversion(new EnumToStringConverter<DatabaseOptionsEnum>());
        builder.Entity<Tenant>().Property(e => e.Currency).HasConversion(new EnumToStringConverter<CurrencyTypesEnum>());
        builder.Entity<Tenant>().Property(e => e.Type).HasConversion(new EnumToStringConverter<TenantTypesEnum>());
        builder.Entity<Tenant>().Property(e => e.ResourceType).HasConversion(new EnumToStringConverter<TenantResourceTypesEnum>());
        builder.Entity<Tenant>().Property(e => e.Country).HasConversion(new EnumToStringConverter<CountriesEnum>());
        builder.Entity<SessionLog>().Property(e => e.HowSessionEnded).HasConversion(new EnumToStringConverter<TerminateSessionReasonsEnum>());
        builder.Entity<VerificationCode>().Property(e => e.RequestType).HasConversion(new EnumToStringConverter<VerificationCodeRequestTypesEnum>());
        builder.Entity<PaymentHistory>().Property(e => e.Status).HasConversion(new EnumToStringConverter<PaymentStatusTypesEnum>());
        builder.Entity<PaymentHistory>().Property(e => e.Currency).HasConversion(new EnumToStringConverter<CurrencyTypesEnum>());
        builder.Entity<PaymentMethod>().Property(e => e.CardType).HasConversion(new EnumToStringConverter<CardTypesEnum>());
        builder.Entity<PaymentMethod>().Property(e => e.CardNetwork).HasConversion(new EnumToStringConverter<CardNetworkTypesEnum>());
        builder.Entity<PaymentMethod>().Property(e => e.Type).HasConversion(new EnumToStringConverter<PaymentMethodTypesEnum>());
        builder.Entity<AccountUser>().Property(e => e.Gender).HasConversion(new EnumToStringConverter<GenderTypeEnum>());
        builder.Entity<RolePermission>().Property(e => e.Access).HasConversion(new EnumToStringConverter<PermissionAccessTypesEnum>());
        builder.Entity<CreditPlan>().Property(e => e.ServiceType).HasConversion(new EnumToStringConverter<CreditServiceTypesEnum>());
        builder.Entity<CreditPlan>().Property(e => e.UnitType).HasConversion(new EnumToStringConverter<UnitTypesEnum>());
        builder.Entity<CreditUsage>().Property(e => e.ServiceType).HasConversion(new EnumToStringConverter<CreditServiceTypesEnum>());
        builder.Entity<CreditUsage>().Property(e => e.RefType).HasConversion(new EnumToStringConverter<UsageSourceTypesEnum>());
        builder.Entity<CreditUsage>().Property(e => e.Action).HasConversion(new EnumToStringConverter<ActionTypesEnum>());
        builder.Entity<TenantSubscription>().Property(e => e.Frequency).HasConversion(new EnumToStringConverter<SubscriptionFrequenciesEnum>());
        builder.Entity<BillingDetail>().Property(e => e.Country).HasConversion(new EnumToStringConverter<CountriesEnum>());
        builder.Entity<BillingHistory>().Property(e => e.PaymentStatus).HasConversion(new EnumToStringConverter<PaymentStatusTypesEnum>());
        builder.Entity<BillingHistory>().Property(e => e.Currency).HasConversion(new EnumToStringConverter<CurrencyTypesEnum>());
        builder.Entity<BillingHistory>().Property(e => e.Type).HasConversion(new EnumToStringConverter<CreditTypesEnum>());
        builder.Entity<SubscriptionPlan>().Property(e => e.Type).HasConversion(new EnumToStringConverter<SubscriptionPlanTypeEnum>());
        builder.Entity<SubscriptionPlan>().Property(e => e.Status).HasConversion(new EnumToStringConverter<PlanStatusTypesEnum>());
        builder.Entity<TenantSubscription>().Property(e => e.Status).HasConversion(new EnumToStringConverter<SubscriptionStatusTypesEnum>());
        builder.Entity<TenantCredit>().Property(e => e.Type).HasConversion(new EnumToStringConverter<CreditTypesEnum>());

        // Configure One-to-One relationship between AccountUser and AccountUser
        builder.Entity<AccountUser>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<AccountUser>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between AccountRole and AccountUser
        builder.Entity<AccountRole>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<AccountRole>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure One-to-One relationship between Tenant and AccountUser
        builder.Entity<Tenant>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Tenant>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        // Configure Many-to-Many relationship between Permission and Custom Role
        builder.Entity<RolePermission>().HasOne(o => o.Permission).WithMany(r => r.RolePermissions).HasForeignKey(fKey => fKey.PermissionId).IsRequired();
        builder.Entity<RolePermission>().HasOne(o => o.AccountRole).WithMany(r => r.RolePermissions).HasForeignKey(fKey => fKey.AccountRoleId).IsRequired();

        // Configure Many-to-Many relationship between AccountUser and AccountRole
        builder.Entity<AccountUser>().HasMany(m => m.UserRoles).WithOne(o => o.User).HasForeignKey(fKey => fKey.UserId).IsRequired();
        builder.Entity<AccountRole>().HasMany(m => m.UserRoles).WithOne(o => o.Role).HasForeignKey(fKey => fKey.RoleId).IsRequired();

        // Configure One-to-One relationship between BillingAccount and AccountUser
        builder.Entity<BillingDetail>().HasOne(one => one.CreatedByUser).WithMany().HasForeignKey(f => f.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<BillingDetail>().HasOne(one => one.LastModifiedByUser).WithMany().HasForeignKey(f => f.LastModifiedByUserId).OnDelete(DeleteBehavior.Restrict);

        builder.Entity<AccountUserRole>().HasOne(u => u.User).WithMany(t => t.UserRoles).HasForeignKey(u => u.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<RolePermission>().HasOne(u => u.AccountRole).WithMany(t => t.RolePermissions).HasForeignKey(u => u.AccountRoleId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<SpaceUser>().HasOne(u => u.Space).WithMany(t => t.SpaceUsers).HasForeignKey(u => u.SpaceId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<AccountUser>().HasOne(a => a.Tenant).WithMany(t => t.Users).HasForeignKey(a => a.TenantId).OnDelete(DeleteBehavior.Cascade);
    }

    // On Save Changes - write tenant Id to table
    public override int SaveChanges()
    {
        // EnforceReadOnly(); // Ensure read-only users cannot modify data
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
        // EnforceReadOnly(); // Ensure read-only users cannot modify data
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

    // TODO: Restrict read-only users (is_temp=true) from Add/Update/Delete operations
    //     // Prevents write operations (Add/Update/Delete) when the user has a read-only token. Defaults to false if claim is missing or invalid.
    //     private void EnforceReadOnly()
    //     {
    //         // Get the current user from HttpContext
    //         var user = _httpContextAccessor.HttpContext?.User;

    //         // Read the "is_temp" claim (string or null)
    //         var claimValue = user?.FindFirst("is_temp")?.Value;

    //         // Safely parse to bool
    //         // If null, empty, or invalid → defaults to false
    //         bool.TryParse(claimValue, out bool isReadOnly);

    //         // If user is marked as read-only, block write operations
    //         if (isReadOnly)
    //         {
    //             // Check if there are any tracked entities with write operations
    //             var hasWriteOperation = ChangeTracker.Entries()
    //                 .Any(e => e.State == EntityState.Added ||
    //                           e.State == EntityState.Modified ||
    //                           e.State == EntityState.Deleted);

    //             // Throw if any write operation is detected
    //             if (hasWriteOperation)
    //             {
    //                 throw new UnauthorizedAccessException(
    //                     "Read-only token cannot modify data.");
    //             }
    //         }
    //     }
}