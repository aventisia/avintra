using Microsoft.EntityFrameworkCore;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// Contract for the unified Apache Camel connector seeding workflow.
/// </summary>
public interface ICamelSeedingService
{
    /// <summary>
    /// Runs the unified seeding workflow. Returns the number of connectors
    /// seeded (tools + config files + mapping entries).
    /// </summary>
    Task<int> SeedAsync(
        WorkspaceDbContext dbContext,
        CancellationToken cancellationToken = default);
}
