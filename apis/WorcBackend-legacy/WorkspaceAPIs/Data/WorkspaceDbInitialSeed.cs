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

            // Migrate existing Job records to populate FlowVersionHistoryId using the latest FlowVersionHistory for each FlowVersion.
            await UpdateJobFlowVersionHistoryAsync(workspaceDbContext);

            // TODO: Remove this temporary migration code after all legacy user mapping data
            // (FlowUser, FlowVersionUser, and QueueUser) has been successfully migrated
            // to ResourceShare in all environments.

            // Remove duplicate records from all configured entities
            await RemoveDuplicateRecordsAsync(workspaceDbContext);

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

    private static async Task UpdateJobFlowVersionHistoryAsync(WorkspaceDbContext workspaceDbContext)
    {
        // Load jobs that do not have a FlowVersionHistoryId assigned.
        var jobs = await workspaceDbContext.Jobs
            .Where(w => w.FlowVersionHistoryId == null)
            .ToListAsync();

        if (!jobs.Any())
            return;

        // Get the FlowVersionIds that require history lookup.
        var flowVersionIds = jobs
            .Select(s => s.FlowVersionId)
            .Distinct()
            .ToList();

        // Get the latest FlowVersionHistoryId for each FlowVersion.
        var latestHistoryLookup = await workspaceDbContext.FlowVersionHistories
            .Where(w => flowVersionIds.Contains(w.FlowVersionId))
            .GroupBy(g => g.FlowVersionId)
            .Select(s => new
            {
                FlowVersionId = s.Key,
                FlowVersionHistoryId = s
                    .OrderByDescending(o => o.CreatedOn)
                    .Select(s1 => (Guid?)s1.Id)
                    .FirstOrDefault()
            })
            .ToDictionaryAsync(x => x.FlowVersionId, x => x.FlowVersionHistoryId);

        var updatedCount = 0;

        // Assign the latest FlowVersionHistoryId to each job.
        foreach (var job in jobs)
        {
            if (latestHistoryLookup.TryGetValue(job.FlowVersionId, out Guid? historyId))
            {
                job.FlowVersionHistoryId = historyId;
                updatedCount++;
            }
        }

        // Persist changes only when records have been updated.
        if (updatedCount > 0)
        {
            Console.WriteLine($"Info: Updating {updatedCount} Job records with the latest FlowVersionHistoryId...");
            await workspaceDbContext.SaveChangesAsync();
            Console.WriteLine("Info: Job FlowVersionHistory migration completed successfully.");
        }
    }

    private static async Task UpdateResourceShareAccessLevelsAsync(
        WorkspaceDbContext workspaceDbContext)
    {
        // Load all ResourceShare records.
        // Access levels "Delete" and "FullAccess" are being deprecated and must be migrated.
        var resourceShares = await workspaceDbContext.ResourceShares
            .ToListAsync();

        var updatedCount = 0;

        foreach (var resourceShare in resourceShares)
        {
            // Replace deprecated "Delete" access with "View".
            if (resourceShare.AccessLevel == ResourceAccessTypeEnum.Delete)
            {
                resourceShare.AccessLevel = ResourceAccessTypeEnum.View;
                updatedCount++;
            }
            // Replace deprecated "FullAccess" access with "Owner".
            else if (resourceShare.AccessLevel == ResourceAccessTypeEnum.FullAccess)
            {
                resourceShare.AccessLevel = ResourceAccessTypeEnum.Owner;
                updatedCount++;
            }
        }

        // Persist changes only when records have been updated.
        if (updatedCount > 0)
        {
            Console.WriteLine($"Info: Updating {updatedCount} ResourceShare records to the new access model...");
            await workspaceDbContext.SaveChangesAsync();
            Console.WriteLine("Info: ResourceShare access level migration completed successfully.");
        }
    }

    private static async Task RemoveDuplicateRecordsAsync(WorkspaceDbContext workspaceDbContext)
    {
        // STEP 1: Identify duplicates using ROW_NUMBER logic
        // Keep only the first record per (UserId, ResourceId)
        var duplicateResourceShareIds = (await workspaceDbContext.ResourceShares
            .ToListAsync())
            .GroupBy(x => new { x.UserId, x.ResourceId })
            .SelectMany(g => g.OrderBy(x => x.Id).Skip(1))
            .Select(x => x.Id)
            .ToList();

        if (duplicateResourceShareIds.Any())
        {
            Console.WriteLine($"Info: Deleting {duplicateResourceShareIds.Count} duplicate ResourceShares...");

            // STEP 2: Delete only by IDs
            var duplicates = workspaceDbContext.ResourceShares
                .Where(w => duplicateResourceShareIds.Contains(w.Id));

            workspaceDbContext.ResourceShares.RemoveRange(duplicates);
            await workspaceDbContext.SaveChangesAsync();

            Console.WriteLine("Info: Duplicate ResourceShares removed.");
        }

        // STEP 1: Identify duplicates using ROW_NUMBER logic
        // Keep only the first record per (UserId, QueueId)
        var duplicateQueueUserIds = (await workspaceDbContext.QueueUsers
            .ToListAsync())
            .GroupBy(g => new { g.UserId, g.QueueId })
            .SelectMany(sm => sm
                .OrderBy(o => o.Id)
                .Skip(1))
            .Select(s => s.Id)
            .ToList();

        if (duplicateQueueUserIds.Any())
        {
            Console.WriteLine($"Info: Deleting {duplicateQueueUserIds.Count} duplicate QueueUsers...");

            // STEP 2: Delete only by IDs
            var duplicateQueueUsers = workspaceDbContext.QueueUsers
                .Where(w => duplicateQueueUserIds.Contains(w.Id));

            workspaceDbContext.QueueUsers.RemoveRange(duplicateQueueUsers);
            await workspaceDbContext.SaveChangesAsync();

            Console.WriteLine("Info: Duplicate QueueUsers removed.");
        }

        // STEP 1: Identify duplicates using ROW_NUMBER logic
        // Keep only the first record per (UserId, FlowVersionId)
        var duplicateFlowVersionIds = (await workspaceDbContext.FlowVersionUsers
            .ToListAsync())
            .GroupBy(g => new { g.UserId, g.FlowVersionId })
            .SelectMany(sm => sm
                .OrderBy(o => o.Id)
                .Skip(1))
            .Select(s => s.Id)
            .ToList();

        if (duplicateFlowVersionIds.Any())
        {
            Console.WriteLine($"Info: Deleting {duplicateFlowVersionIds.Count} duplicate FlowVersionUsers...");

            // STEP 2: Delete only by IDs
            var duplicateFlowVersions = workspaceDbContext.FlowVersionUsers
                .Where(w => duplicateFlowVersionIds.Contains(w.Id));

            workspaceDbContext.FlowVersionUsers.RemoveRange(duplicateFlowVersions);
            await workspaceDbContext.SaveChangesAsync();

            Console.WriteLine("Info: Duplicate FlowVersionUsers removed.");
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

        var existingKeys = (await workspaceDbContext.ResourceShares
            .Where(w => w.ResourceType == ResourceTypeEnum.Flow)
            .Select(s => new { s.UserId, s.ResourceId })
            .ToListAsync())
            .Select(s => $"{s.UserId}:{s.ResourceId}")
            .ToHashSet();

        // Convert FlowUser records into ResourceShare records.
        var resourceShares = flowUsers
        .Where(w => !existingKeys.Contains($"{w.UserId}:{w.FlowId}"))
        .Select(s => new ResourceShare
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