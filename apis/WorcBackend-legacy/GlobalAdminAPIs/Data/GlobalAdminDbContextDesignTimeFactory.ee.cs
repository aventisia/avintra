using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace GlobalAdminAPIs.Data;

/// <summary>
/// Design-time factory used only by the EF Core tooling (dotnet ef migrations).
/// </summary>
public class GlobalAdminDbContextDesignTimeFactory : IDesignTimeDbContextFactory<GlobalAdminDbContext>
{
    public GlobalAdminDbContext CreateDbContext(string[] args)
    {
        EnvironmentConfigurationExtensions.LoadDotEnvForKestrel();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var environmentConfig = new EnvironmentConfig();
        configuration.GetSection("EnvironmentConfig").Bind(environmentConfig);

        var pgHost = Environment.GetEnvironmentVariable("POSTGRESQL_HOST") ?? environmentConfig.PostgresqlHost;
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

        var optionsBuilder = new DbContextOptionsBuilder<GlobalAdminDbContext>();
        optionsBuilder.UseNpgsql(
            $"Host={pgHost};Port={pgPort};Username={pgUsername};Password={pgPassword};Database=GlobalAdminDb;Include Error Detail=true");

        return new GlobalAdminDbContext(optionsBuilder.Options);
    }
}
