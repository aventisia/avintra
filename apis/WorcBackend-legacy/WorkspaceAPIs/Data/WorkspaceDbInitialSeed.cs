// For more info on How to seed data, watch YT video: https://www.youtube.com/watch?v=0B7QjRSvcGI
namespace WorkspaceAPIs.Data;

public static class WorkspaceDbInitialSeed
{
    public async static Task<WebApplication> SeedInitialData(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            // Get workspaceDbContext
            using var _workspaceDbContext = scope.ServiceProvider.GetRequiredService<WorkspaceDbContext>();

            // Apply pending database migrations
            await ApplyMigrationsAsync(_workspaceDbContext);
            return app;
        }
    }

    // Apply pending database migrations
    private async static Task ApplyMigrationsAsync(WorkspaceDbContext workspaceDbContext)
    {
        try
        {
            Console.WriteLine("Info: Applying database migrations...");
            await workspaceDbContext.Database.MigrateAsync();
            Console.WriteLine("Info: Database migrations applied successfully.");

            // TODO: Remove this temporary migration code after all legacy user mapping data
            // (FlowUser, FlowVersionUser, and QueueUser) has been successfully migrated
            // to ResourceShare in all environments.

            // Migrate legacy FlowUser records to ResourceShare records.
            await MigrateFlowUsersToResourceSharesAsync(workspaceDbContext);

            // Migrate ResourceShare records back to FlowVersionUser records.
            await MigrateResourceSharesToFlowVersionUsersAsync(workspaceDbContext);

            // Migrate ResourceShare records back to QueueUser records.
            await MigrateResourceSharesToQueueUsersAsync(workspaceDbContext);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: An error occurred while applying database migrations: {ex.Message}");
            throw;
        }
    }

    // Temporary data migration that converts legacy FlowUser records into ResourceShare records and removes the old FlowUser entries.
    // Remove this method after all environments have been migrated.
    private static async Task MigrateFlowUsersToResourceSharesAsync(WorkspaceDbContext workspaceDbContext)
    {
        // Fetch all existing FlowUser records that need to be migrated.
        var flowUsers = await workspaceDbContext.FlowUsers.ToListAsync();

        // Nothing to migrate.
        if (!flowUsers.Any())
        {
            return;
        }

        Console.WriteLine($"Info: Migrating {flowUsers.Count} FlowUsers to ResourceShares...");

        // Convert FlowUser records into ResourceShare records.
        var resourceShares = flowUsers.Select(s => new ResourceShare
        {
            UserId = s.UserId,
            ResourceId = s.FlowId,
            ResourceType = ResourceTypeEnum.Flow,
            AccessLevel = Enum.TryParse<ResourceAccessTypeEnum>(
                s.Type.ToString(),
                out var accessLevel)
                ? accessLevel
                : ResourceAccessTypeEnum.View,
            TenantId = s.TenantId
        }).ToList();

        // Insert the new ResourceShare records.
        await workspaceDbContext.ResourceShares.AddRangeAsync(resourceShares);
        await workspaceDbContext.SaveChangesAsync();

        // Remove the legacy FlowUser records after successful migration.
        workspaceDbContext.FlowUsers.RemoveRange(flowUsers);
        await workspaceDbContext.SaveChangesAsync();

        Console.WriteLine("Info: Successfully migrated FlowUsers to ResourceShares and removed old FlowUser records.");
    }

    // Temporary data migration that converts ResourceShare records for FlowVersions  back into FlowVersionUser records and removes the ResourceShare entries.
    // Remove this method after all environments have been migrated.
    private static async Task MigrateResourceSharesToFlowVersionUsersAsync(WorkspaceDbContext workspaceDbContext)
    {
        // Fetch ResourceShare records that represent FlowVersion shares.
        var resourceShares = await workspaceDbContext.ResourceShares
            .Where(w => w.ResourceType == ResourceTypeEnum.FlowVersion)
            .ToListAsync();

        // Nothing to migrate.
        if (!resourceShares.Any())
        {
            return;
        }

        Console.WriteLine($"Info: Migrating {resourceShares.Count} ResourceShares to FlowVersionUsers...");

        // Convert ResourceShare records into FlowVersionUser records.
        var flowVersionUsers = resourceShares.Select(s => new FlowVersionUser
        {
            UserId = s.UserId,
            FlowVersionId = s.ResourceId,
            TenantId = s.TenantId
        }).ToList();

        // Insert the new FlowVersionUser records.
        await workspaceDbContext.FlowVersionUsers.AddRangeAsync(flowVersionUsers);
        await workspaceDbContext.SaveChangesAsync();

        // Remove the ResourceShare records after successful migration.
        workspaceDbContext.ResourceShares.RemoveRange(resourceShares);
        await workspaceDbContext.SaveChangesAsync();

        Console.WriteLine("Info: Successfully migrated ResourceShares to FlowVersionUsers and removed old ResourceShare records.");
    }

    // Temporary data migration that converts ResourceShare records back into QueueUser records and removes the ResourceShare entries.
    // Remove this method after all environments have been migrated.
    private static async Task MigrateResourceSharesToQueueUsersAsync(WorkspaceDbContext workspaceDbContext)
    {
        // Fetch ResourceShare records that represent Queue shares.
        var resourceShares = await workspaceDbContext.ResourceShares
            .Where(rs => rs.ResourceType == ResourceTypeEnum.Queue)
            .ToListAsync();

        // Nothing to migrate.
        if (!resourceShares.Any())
        {
            return;
        }

        Console.WriteLine($"Info: Migrating {resourceShares.Count} ResourceShares to QueueUsers...");

        // Convert ResourceShare records into QueueUser records.
        var queueUsers = resourceShares.Select(s => new QueueUser
        {
            UserId = s.UserId,
            QueueId = s.ResourceId,
            AccessType = Enum.TryParse<QueueWorkItemAccessTypesEnum>(
                s.AccessLevel.ToString(),
                out var accessType)
                ? accessType
                : QueueWorkItemAccessTypesEnum.View,
            TenantId = s.TenantId,
            CreatedByUserId = s.UserId,
            LastModifiedByUserId = s.UserId
        }).ToList();

        // Insert the new QueueUser records.
        await workspaceDbContext.QueueUsers.AddRangeAsync(queueUsers);
        await workspaceDbContext.SaveChangesAsync();

        // Remove the ResourceShare records after successful migration.
        workspaceDbContext.ResourceShares.RemoveRange(resourceShares);
        await workspaceDbContext.SaveChangesAsync();

        Console.WriteLine("Info: Successfully migrated ResourceShares to QueueUsers and removed old ResourceShare records.");
    }
}