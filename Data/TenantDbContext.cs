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
    }

    /// <summary>
    /// Only to read Tenants specific info from the database to validate
    /// Tenant existance/activeness/Db config at the time of api request.
    /// </summary>
    public DbSet<TenantReadOnly> ReadOnlyTenants { get; set; }
}