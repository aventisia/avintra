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
        // Load .env.local when running locally so the design-time connection string
        // matches the values used at runtime (mirrors LoadEnvironmentConfiguration in
        // AspNetToolkit, which only runs when the app is started via Program.cs).
        var aspnetEnvironment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (string.Equals(aspnetEnvironment, "Localhost", StringComparison.OrdinalIgnoreCase))
        {
            var envLocalPath = Path.Combine(Directory.GetCurrentDirectory(), ".env.local");
            if (File.Exists(envLocalPath))
            {
                DotNetEnv.Env.Load(envLocalPath);
            }
        }

        // Build configuration from appsettings.json (same source as Program.cs)
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var environmentConfig = new EnvironmentConfig();
        configuration.GetSection("EnvironmentConfig").Bind(environmentConfig);

        // .env.local / environment variables take precedence, then fall back to
        // appsettings values (ignoring the "env_var" placeholder used in appsettings.json).
        var pgHost = Environment.GetEnvironmentVariable("POSTGRESQL_HOST")
            ?? environmentConfig.PostgresqlHost;
        if (string.IsNullOrWhiteSpace(pgHost) || pgHost == "env_var")
        {
            pgHost = "localhost";
        }

        var pgPortRaw = Environment.GetEnvironmentVariable("POSTGRESQL_PORT");
        var pgPort = int.TryParse(pgPortRaw, out var pgPortFromEnv) && pgPortFromEnv != 0
            ? pgPortFromEnv
            : (environmentConfig.PostgresqlPort == 0 ? 5432 : environmentConfig.PostgresqlPort);
        var pgUsername = Environment.GetEnvironmentVariable("POSTGRESQL_USERNAME")
            ?? environmentConfig.PostgresqlUsername ?? string.Empty;
        var pgPassword = Environment.GetEnvironmentVariable("POSTGRESQL_PASSWORD")
            ?? environmentConfig.PostgresqlPassword ?? string.Empty;
        var pgDatabase = Environment.GetEnvironmentVariable("POSTGRESQL_WORKSPACE_DB_NAME")
            ?? environmentConfig.PostgresqlWorkspaceDbName;

        var appDbConnectionString = $"Host={pgHost};Port={pgPort};Username={pgUsername};Password={pgPassword};Database={pgDatabase};Include Error Detail=true";

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
    public ConfigureEnvironmentType CurrentEnvType { get; set; } = ConfigureEnvironmentType.Dev;

    public Task<string> SetTenantAndUser(string tenantId, string userId)
    {
        return Task.FromResult("pass");
    }
}
