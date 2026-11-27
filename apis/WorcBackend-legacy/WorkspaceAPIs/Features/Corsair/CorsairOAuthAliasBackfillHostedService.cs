using Microsoft.EntityFrameworkCore;

namespace WorkspaceAPIs.Features.Corsair;

/// <summary>
/// Copies pre-flattening OAuth credentials onto their per-credential plugin instance rows
/// once at startup, so existing tokens keep working without a reconnect. Best-effort:
/// failures are logged and never block startup.
/// </summary>
public class CorsairOAuthAliasBackfillHostedService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CorsairOAuthAliasBackfillHostedService> _logger;

    public CorsairOAuthAliasBackfillHostedService(
        IServiceProvider serviceProvider,
        ILogger<CorsairOAuthAliasBackfillHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _ = Task.Run(() => RunAsync(cancellationToken), cancellationToken);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    private async Task RunAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<WorkspaceDbContext>();
            var sidecar = scope.ServiceProvider.GetRequiredService<ICorsairSidecarService>();
            var configRepository = scope.ServiceProvider.GetRequiredService<CorsairConfigRepository>();

            var credentials = await context.VaultCredentials
                .IgnoreQueryFilters()
                .Select(credential => new { credential.Id, credential.Type })
                .ToListAsync(cancellationToken);

            var acknowledged = 0;
            foreach (var credential in credentials)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var plugin = CorsairPluginResolver.ResolveOAuthPlugin(credential.Type, configRepository);
                if (string.IsNullOrWhiteSpace(plugin))
                {
                    continue;
                }

                if (await sidecar.BackfillIntegrationKeysAsync(credential.Id, plugin, cancellationToken))
                {
                    acknowledged++;
                }
            }

            _logger.LogInformation(
                "Corsair OAuth alias backfill finished: {Acknowledged}/{Total} credentials acknowledged.",
                acknowledged,
                credentials.Count);
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Corsair OAuth alias backfill failed.");
        }
    }
}
