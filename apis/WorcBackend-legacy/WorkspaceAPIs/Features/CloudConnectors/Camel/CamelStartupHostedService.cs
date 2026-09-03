using AspNetToolkit.Config;
using AspNetToolkit.Data;
using Microsoft.EntityFrameworkCore;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Background hosted service that runs the unified Camel connector seeding
/// workflow at startup, independent of the DB seed process.
///
/// On start it:
///   1. Restores the Cloud-Connector mapping files if they were deleted
///      (action-selector mapping, CamelActionMapping).
///   2. Resolves the platform admin user (from <c>EnvironmentConfig.OnPremAdminEmail</c>).
///   3. Runs the unified <see cref="CamelSeedingService"/> workflow, which
///      seeds platform tools, generates connector JSON files, and regenerates
///      the action-selector mapping in a single pass.
///
/// If the harness is unreachable at startup, it retries with backoff so the
/// catalog is eventually loaded once the harness comes up. The mapping-file
/// restore runs before the retry loop so the frontend selector is never
/// missing even when catalog seeding is temporarily skipped.
/// </summary>
public class CamelStartupHostedService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CamelStartupHostedService> _logger;
    private readonly EnvironmentConfig _environmentConfig;

    public CamelStartupHostedService(
        IServiceProvider serviceProvider,
        ILogger<CamelStartupHostedService> logger,
        EnvironmentConfig environmentConfig)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _environmentConfig = environmentConfig;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // // Skip Camel startup seeding on localhost to avoid unnecessary harness calls.
        // if (_serviceProvider.GetRequiredService<IHostEnvironment>().IsEnvironment("Localhost"))
        // {
        //     _logger.LogInformation("Skipping Camel startup seeding on localhost.");
        //     return;
        // }

        // Small delay so the app finishes startup and the DB seed completes first.
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

        // Restore the mapping files before retrying catalog seeding, so the
        // frontend action selector / Camel node resolution never 404s.
        try
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var mappingGenerator = scope.ServiceProvider.GetRequiredService<CamelMappingFilesGenerator>();
                var restored = mappingGenerator.RestoreMissing();
                if (restored > 0)
                {
                    _logger.LogInformation("Restored {Restored} missing Cloud-Connector mapping files at startup.", restored);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to restore Cloud-Connector mapping files at startup.");
        }

        var maxAttempts = 3;
        for (var attempt = 1; attempt <= maxAttempts && !stoppingToken.IsCancellationRequested; attempt++)
        {
            try
            {
                var handled = await RunOnceAsync(stoppingToken);
                if (handled)
                {
                    return;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Camel startup seeding attempt {Attempt} failed.", attempt);
            }

            if (attempt < maxAttempts)
            {
                var delay = TimeSpan.FromSeconds(10 * attempt);
                _logger.LogInformation("Retrying Camel startup seeding in {DelaySeconds}s (attempt {Attempt}/{MaxAttempts}).",
                    delay.TotalSeconds, attempt + 1, maxAttempts);
                await Task.Delay(delay, stoppingToken);
            }
        }

        _logger.LogWarning("Camel startup seeding did not complete after {MaxAttempts} attempts.", maxAttempts);
    }

    private async Task<bool> RunOnceAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<WorkspaceDbContext>();
        var seedingService = scope.ServiceProvider.GetRequiredService<ICamelSeedingService>();
        var catalogClient = scope.ServiceProvider.GetRequiredService<CamelCatalogClient>();

        // Fetch the API connector list up-front. When the harness is unreachable
        // the list comes back empty and is NOT cached, so a later retry attempt
        // re-queries it once the harness is up.
        var connectorList = await catalogClient.GetConnectorListAsync(cancellationToken);

        // Run the unified seeding workflow: tools + connector JSON + mapping.
        var seeded = await seedingService.SeedAsync(dbContext, cancellationToken);

        _logger.LogInformation(
            "Camel startup: {Seeded} connectors seeded, {ConnectorCount} connectors available from the harness.",
            seeded, connectorList.Count);

        // If the harness was unreachable (empty connector list), do NOT report
        // this attempt as handled: the retry loop backs off and tries again so
        // the full catalog is seeded once the harness comes up.
        if (connectorList.Count == 0)
        {
            _logger.LogWarning(
                "Camel harness connector list is empty (harness unreachable); retrying so the full connector catalog is seeded once it is up.");
            return false;
        }

        return true;
    }

    /// <summary>
    /// Resolves the default admin workspace user by <c>EnvironmentConfig.OnPremAdminEmail</c>
    /// from the tenant (AccountsDb) context, mirroring the DB seed logic.
    /// </summary>
    private async Task<(Guid UserId, Guid TenantId)?> ResolvePlatformAdminUserAsync(
        WorkspaceDbContext workspaceDbContext,
        TenantDbContext tenantDbContext,
        CancellationToken cancellationToken)
    {
        var adminEmail = _environmentConfig.OnPremAdminEmail?.Trim();
        if (string.IsNullOrWhiteSpace(adminEmail))
        {
            _logger.LogWarning("EnvironmentConfig.OnPremAdminEmail is not set. Cannot resolve platform admin user.");
            return null;
        }

        var accountUser = await tenantDbContext.ReadOnlyAccountUsers
            .FirstOrDefaultAsync(u =>
                (u.Email != null && u.Email.ToLower() == adminEmail.ToLower())
                || (u.UserName != null && u.UserName.ToLower() == adminEmail.ToLower()),
                cancellationToken);

        if (accountUser is null)
        {
            _logger.LogWarning("Default admin account user not found for email {AdminEmail}.", adminEmail);
            return null;
        }

        if (accountUser.TenantId is null || accountUser.TenantId == Guid.Empty)
        {
            _logger.LogWarning("Default admin account user {UserId} does not have an assigned tenant.", accountUser.Id);
            return null;
        }

        var adminTenantId = accountUser.TenantId.Value;

        var workspaceUser = await workspaceDbContext.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == accountUser.Id, cancellationToken);

        if (workspaceUser is null)
        {
            workspaceUser = new WorkspaceUser
            {
                Id = accountUser.Id,
                TenantId = adminTenantId,
                UserName = accountUser.UserName ?? adminEmail,
                FirstName = accountUser.FirstName ?? "Platform",
                LastName = accountUser.LastName ?? "Admin",
            };
            await workspaceDbContext.Users.AddAsync(workspaceUser, cancellationToken);
            await workspaceDbContext.SaveChangesAsync(cancellationToken);
        }

        return (workspaceUser.Id, adminTenantId);
    }
}
