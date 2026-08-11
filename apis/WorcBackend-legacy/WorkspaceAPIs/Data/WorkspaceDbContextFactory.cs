using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace WorkspaceAPIs.Data;

/// <summary>
/// Design-time factory used only by the EF Core tooling (dotnet ef migrations).
/// The runtime DbContext requires a scoped <see cref="ICurrentTenantService"/> that is
/// resolved from the HTTP context, so a stub is provided here with a zero tenant id.
/// </summary>
public class WorkspaceDbContextFactory : IDesignTimeDbContextFactory<WorkspaceDbContext>
{
    public WorkspaceDbContext CreateDbContext(string[] args)
    {
        // Build configuration from appsettings.json (same source as Program.cs)
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var environmentConfig = new EnvironmentConfig();
        configuration.GetSection("EnvironmentConfig").Bind(environmentConfig);

        var pgHost = string.IsNullOrWhiteSpace(environmentConfig.PostgresqlHost) ? "localhost" : environmentConfig.PostgresqlHost;
        var pgPort = environmentConfig.PostgresqlPort == 0 ? 5432 : environmentConfig.PostgresqlPort;
        var pgUsername = environmentConfig.PostgresqlUsername ?? string.Empty;
        var pgPassword = environmentConfig.PostgresqlPassword ?? string.Empty;

        var appDbConnectionString = $"Host={pgHost};Port={pgPort};Username={pgUsername};Password={pgPassword};Database=WorkspaceDb;Include Error Detail=true";

        var optionsBuilder = new DbContextOptionsBuilder<WorkspaceDbContext>();
        optionsBuilder.UseNpgsql(appDbConnectionString, npgsqlOptions => npgsqlOptions.UseVector());

        // Stub tenant service: design-time context has no current tenant
        var currentTenantService = new DesignTimeCurrentTenantService();

        return new WorkspaceDbContext(currentTenantService, optionsBuilder.Options);
    }
}

/// <summary>
/// Minimal stub used only at design time so the EF tooling can construct the DbContext.
/// </summary>
public class DesignTimeCurrentTenantService : ICurrentTenantService
{
    public Guid CurrentTenantId { get; set; } = Guid.Empty;

    public Guid CurrentUserId { get; set; } = Guid.Empty;

    public string CurrentTenantContainerName { get; } = string.Empty;
    public Guid CurrentSpaceId { get; set; } = Guid.Empty;

    public Task<string> SetTenantAndUser(string tenantId, string userId)
    {
        return Task.FromResult("pass");
    }
}
