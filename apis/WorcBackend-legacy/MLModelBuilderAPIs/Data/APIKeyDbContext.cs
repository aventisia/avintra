/* Reference Articles:
 * https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

namespace MLModelBuilderAPIs.Data;

/// <summary>
/// The <c>APIKeyDbContext</c> is used exclusively to retrieve tenant-specific information 
/// for validating API requests. It checks if the tenant exists, is active, 
/// and has a valid database configuration.
/// This context is utilized by <c>CurrentTenantService</c>.
/// </summary>
public class APIKeyDbContext : DbContext
{
    public APIKeyDbContext(DbContextOptions<APIKeyDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure enum-to-string conversions here if needed
    }

    /// <summary>
    /// DbSet for accessing tenant-specific API keys used for validation during API requests.
    /// </summary>
    public DbSet<AIProjectVersionApiKeyReadOnly> AIProjectVersionAPIKeyReadOnly { get; set; }
}
