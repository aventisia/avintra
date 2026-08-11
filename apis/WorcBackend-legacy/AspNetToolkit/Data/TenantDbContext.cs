/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

namespace AspNetToolkit.Data;

/// <summary>
/// This TenantDbContext is only to read Tenants specific info from the database to validate
/// Tenant existance/activeness/Db config at the time of api request.
/// CurrentTenantService is going to use this
/// </summary>
public class TenantDbContext : DbContext
{
    public TenantDbContext(DbContextOptions<TenantDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Enum to string conversion
        modelBuilder.Entity<TenantReadOnly>().Property(e => e.DbOption).HasConversion(new EnumToStringConverter<DatabaseOptionsEnum>());

        // JSON column for per-tenant notification settings
        modelBuilder.Entity<TenantReadOnly>()
            .Property(e => e.NotificationSettings)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => string.IsNullOrWhiteSpace(v) ? null : System.Text.Json.JsonSerializer.Deserialize<NotificationSettings>(v, (System.Text.Json.JsonSerializerOptions?)null));

        // Composite key for the read-only user-role M2M projection
        modelBuilder.Entity<AccountUserRoleReadOnly>().HasKey(e => new { e.UserId, e.RoleId });
    }

    /// <summary>
    /// Only to read Tenants specific info from the database to validate
    /// Tenant existance/activeness/Db config at the time of api request.
    /// </summary>
    public DbSet<TenantReadOnly> ReadOnlyTenants { get; set; }
    public DbSet<ActiveSessionReadOnly> ReadOnlyActiveSessions { get; set; }

    /// <summary>
    /// Read-only access to AccountsDb users/roles/credits/subscriptions for
    /// notification recipient resolution and background jobs. Do not write.
    /// </summary>
    public DbSet<AccountUserReadOnly> ReadOnlyAccountUsers { get; set; }
    public DbSet<AccountRoleReadOnly> ReadOnlyAccountRoles { get; set; }
    public DbSet<AccountUserRoleReadOnly> ReadOnlyAccountUserRoles { get; set; }
    public DbSet<TenantCreditReadOnly> ReadOnlyTenantCredits { get; set; }
    public DbSet<TenantSubscriptionReadOnly> ReadOnlyTenantSubscriptions { get; set; }
}