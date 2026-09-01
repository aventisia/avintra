using AspNetToolkit.Config;
using AspNetToolkit.Data;
using Microsoft.EntityFrameworkCore;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2;

/// <summary>
/// Background hosted service that runs the CamelV2 catalog-driven seeding and
/// node generation at startup, independent of the DB seed process.
///
/// On start it:
///   1. Restores the Cloud-Connector mapping files if they were deleted
///      (action-selector mapping, CamelActionMapping, github/m365 openapi specs).
///   2. Resolves the platform admin user (from <c>EnvironmentConfig.OnPremAdminEmail</c>).
///   3. Fetches the connector catalog from the harness.
///   4. Seeds every connector into <c>ws_Tools</c>.
///   5. Generates the <c>ConfigFiles/CamelV2/&lt;Family&gt;/&lt;Action&gt;Connector.json</c> nodes.
///
/// If the harness is unreachable at startup, it retries with backoff so the
/// catalog is eventually loaded once the harness comes up. The mapping-file
/// restore runs before the retry loop so the frontend selector is never
/// missing even when catalog seeding is temporarily skipped.
/// </summary>
public class CamelV2StartupHostedService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CamelV2StartupHostedService> _logger;
    private readonly EnvironmentConfig _environmentConfig;

    public CamelV2StartupHostedService(
        IServiceProvider serviceProvider,
        ILogger<CamelV2StartupHostedService> logger,
        EnvironmentConfig environmentConfig)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _environmentConfig = environmentConfig;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Small delay so the app finishes startup and the DB seed completes first.
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

        // Restore the mapping files before retrying catalog seeding, so the
        // frontend action selector / Camel node resolution never 404s.
        try
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var mappingGenerator = scope.ServiceProvider.GetRequiredService<CamelV2MappingFilesGenerator>();
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

        var maxAttempts = 5;
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
                _logger.LogError(ex, "CamelV2 startup seeding attempt {Attempt} failed.", attempt);
            }

            if (attempt < maxAttempts)
            {
                var delay = TimeSpan.FromSeconds(10 * attempt);
                _logger.LogInformation("Retrying CamelV2 startup seeding in {DelaySeconds}s (attempt {Attempt}/{MaxAttempts}).",
                    delay.TotalSeconds, attempt + 1, maxAttempts);
                await Task.Delay(delay, stoppingToken);
            }
        }

        _logger.LogWarning("CamelV2 startup seeding did not complete after {MaxAttempts} attempts.", maxAttempts);
    }

    private async Task<bool> RunOnceAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<WorkspaceDbContext>();
        var tenantDbContext = scope.ServiceProvider.GetRequiredService<TenantDbContext>();
        var seeder = scope.ServiceProvider.GetRequiredService<CamelV2ToolSeeder>();
        var generator = scope.ServiceProvider.GetRequiredService<CamelV2NodeGenerator>();

        // Resolve the platform admin user that owns platform tools.
        var admin = await ResolvePlatformAdminUserAsync(dbContext, tenantDbContext, cancellationToken);
        if (admin is null)
        {
            _logger.LogWarning("No platform admin user resolved; skipping CamelV2 seeding.");
            return false;
        }

        var seeded = await seeder.SeedAsync(dbContext, cancellationToken);
        var generated = await generator.GenerateAsync(cancellationToken);

        _logger.LogInformation(
            "CamelV2 startup complete: {Seeded} tools seeded, {Generated} node configs generated.",
            seeded, generated);
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
