using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.DependencyInjection;
using WorkspaceAPIs.Data;

namespace WorkspaceAPIs;

/// <summary>
/// Design-time factory for WorkspaceDbContext, used by dotnet-ef migration commands
/// without requiring a fully running application (no environment variables needed).
/// </summary>
public class WorkspaceDbContextDesignTimeFactory : IDesignTimeDbContextFactory<WorkspaceDbContext>
{
    public WorkspaceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<WorkspaceDbContext>();

        // Use a placeholder connection string for design-time only.
        // Actual connection string is loaded from environment config at runtime.
        optionsBuilder.UseNpgsql("Host=localhost;Database=WorkspaceDb;Username=postgres;Password=postgres", options =>
        {
            options.UseVector();
        });

        // Create a minimal ICurrentTenantService stub for design-time
        var services = new ServiceCollection();
        services.AddScoped<AspNetToolkit.Services.ICurrentTenantService, DesignTimeCurrentTenantService>();
        var sp = services.BuildServiceProvider();
        var tenantService = sp.GetRequiredService<AspNetToolkit.Services.ICurrentTenantService>();

        return new WorkspaceDbContext(tenantService, optionsBuilder.Options);
    }

    private class DesignTimeCurrentTenantService : AspNetToolkit.Services.ICurrentTenantService
    {
        public Guid CurrentTenantId { get; set; } = Guid.Empty;
        public Guid CurrentUserId { get; set; } = Guid.Empty;
        public string CurrentTenantContainerName => string.Empty;
        public Task<string> SetTenantAndUser(string tenantId, string userId) => Task.FromResult(string.Empty);
    }
}
