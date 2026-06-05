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

            // Migrate legacy FlowVersionUser records to ResourceShare records.
            await MigrateFlowVersionUsersToResourceSharesAsync(workspaceDbContext);

            // Migrate legacy QueueUser records to ResourceShare records.
            await MigrateQueueUsersToResourceSharesAsync(workspaceDbContext);
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

    // Temporary data migration that converts legacy FlowVersionUser records into ResourceShare records and removes the old FlowVersionUser entries.
    // Remove this method after all environments have been migrated.
    private static async Task MigrateFlowVersionUsersToResourceSharesAsync(WorkspaceDbContext workspaceDbContext)
    {
        // Fetch all existing FlowVersionUser records that need to be migrated.
        var flowVersionUsers = await workspaceDbContext.FlowVersionUsers.ToListAsync();

        // Nothing to migrate.
        if (!flowVersionUsers.Any())
        {
            return;
        }

        Console.WriteLine($"Info: Migrating {flowVersionUsers.Count} FlowVersionUsers to ResourceShares...");

        // Convert FlowVersionUser records into ResourceShare records.
        var resourceShares = flowVersionUsers.Select(s => new ResourceShare
        {
            UserId = s.UserId,
            ResourceId = s.FlowVersionId,
            ResourceType = ResourceTypeEnum.FlowVersion,
            AccessLevel = ResourceAccessTypeEnum.View,
            TenantId = s.TenantId
        }).ToList();

        // Insert the new ResourceShare records.
        await workspaceDbContext.ResourceShares.AddRangeAsync(resourceShares);
        await workspaceDbContext.SaveChangesAsync();

        // Remove the legacy FlowVersionUser records after successful migration.
        workspaceDbContext.FlowVersionUsers.RemoveRange(flowVersionUsers);
        await workspaceDbContext.SaveChangesAsync();

        Console.WriteLine("Info: Successfully migrated FlowVersionUsers to ResourceShares and removed old FlowVersionUser records.");
    }

    // Temporary data migration that converts legacy QueueUser records into ResourceShare records and removes the old QueueUser entries.
    // Remove this method after all environments have been migrated.
    private static async Task MigrateQueueUsersToResourceSharesAsync(WorkspaceDbContext workspaceDbContext)
    {
        // Fetch all existing QueueUser records that need to be migrated.
        var queueUsers = await workspaceDbContext.QueueUsers.ToListAsync();

        // Nothing to migrate.
        if (!queueUsers.Any())
        {
            return;
        }

        Console.WriteLine($"Info: Migrating {queueUsers.Count} QueueUsers to ResourceShares...");

        // Convert QueueUser records into ResourceShare records.
        var resourceShares = queueUsers.Select(s => new ResourceShare
        {
            UserId = s.UserId,
            ResourceId = s.QueueId,
            ResourceType = ResourceTypeEnum.Queue,
            AccessLevel = Enum.TryParse<ResourceAccessTypeEnum>(
                s.AccessType.ToString(),
                out var accessLevel)
                ? accessLevel
                : ResourceAccessTypeEnum.View,
            TenantId = s.TenantId
        }).ToList();

        // Insert the new ResourceShare records.
        await workspaceDbContext.ResourceShares.AddRangeAsync(resourceShares);
        await workspaceDbContext.SaveChangesAsync();

        // Remove the legacy QueueUser records after successful migration.
        workspaceDbContext.QueueUsers.RemoveRange(queueUsers);
        await workspaceDbContext.SaveChangesAsync();

        Console.WriteLine("Info: Successfully migrated QueueUsers to ResourceShares and removed old QueueUser records.");
    }
}