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

            // TODO: Machine entity: Remove this temporary migration code after all legacy data is migrated
            //await UpdateMachineTableAsync(workspaceDbContext);

            // TODO: Remove once reached the main branch and deployed to production.
            await UpdateJobStatus_Abort2Aborted(workspaceDbContext);

            // TODO: Remove once reached the main branch and deployed to production.
            await UpdateTriggerType_RemoveTriggerSuffix(workspaceDbContext);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: An error occurred while applying database migrations: {ex.Message}");
            throw;
        }
    }

    private static async Task UpdateMachineTableAsync(WorkspaceDbContext workspaceDbContext)
    {
        // Load all machine records
        var machines = await workspaceDbContext.Machines.IgnoreQueryFilters()
            .Where(w => true)
            .ToListAsync();

        foreach (var machine in machines)
        {
            // Update the MachineName for each machine record
            machine.Name = MachinesTableHelpers.BuildMachineName(
                machine.OperatingSystem,
                machine.OsID,
                machine.Username);
        }

        await workspaceDbContext.SaveChangesAsync();


        // This section seems misplaced and should be removed, as it references 'jobs' which is not defined in this method.
    }

    // TODO: Remove once reached the main branch and deployed to production.
    private static async Task UpdateJobStatus_Abort2Aborted(WorkspaceDbContext workspaceDbContext)
    {
        // Load jobs that have Abort status
        var jobs = await workspaceDbContext.Jobs.IgnoreQueryFilters()
            .Where(w => w.Status == JobStatusEnum.Abort)
            .ToListAsync();

        // Update the status of each job to Aborted
        int updatedCount = 0;
        foreach (var job in jobs)
        {
            // Fetch the latest FlowVersionHistory for the job's FlowVersionId.
            var latestFlowVersionHistory = await workspaceDbContext.FlowVersionHistories.IgnoreQueryFilters()
                .Where(fvh => fvh.FlowVersionId == job.FlowVersionId)
                .OrderByDescending(fvh => fvh.CreatedOn)
                .FirstOrDefaultAsync();

            if (latestFlowVersionHistory != null)
            {
                job.FlowVersionHistoryId = latestFlowVersionHistory.Id;
                updatedCount++;
            }
        }

        Console.WriteLine($"Info: Updating {updatedCount} Job records with the latest FlowVersionHistoryId...");
        await workspaceDbContext.SaveChangesAsync();
        Console.WriteLine($"Info: Updated {jobs.Count} Job records from 'Abort' to 'Aborted' status.");
    }

    // TODO: Remove once reached the main branch and deployed to production.
    private static async Task UpdateTriggerType_RemoveTriggerSuffix(WorkspaceDbContext workspaceDbContext)
    {
        // Load triggers that have the "Trigger" suffix
        var triggers = await workspaceDbContext.Triggers.IgnoreQueryFilters().ToListAsync();

        // Update the type of each trigger by removing the "Trigger" suffix
        foreach (var trigger in triggers)
        {
            switch (trigger.TriggerType)
            {
                case TriggerTypesEnum.ManualTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Manual;
                    break;
                case TriggerTypesEnum.APITrigger:
                    trigger.TriggerType = TriggerTypesEnum.Api;
                    break;
                case TriggerTypesEnum.WebhookTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Webhook;
                    break;
                case TriggerTypesEnum.QueueTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Queue;
                    break;
                case TriggerTypesEnum.EventTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Event;
                    break;
                case TriggerTypesEnum.TimeTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Time;
                    break;
                case TriggerTypesEnum.EmailTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Email;
                    break;
                case TriggerTypesEnum.MessageTrigger:
                    trigger.TriggerType = TriggerTypesEnum.Message;
                    break;
                default:
                    // If the trigger type does not have a "Trigger" suffix, do nothing
                    break;
            }
        }

        // Save changes to the database
        await workspaceDbContext.SaveChangesAsync();
        Console.WriteLine($"Info: Updated {triggers.Count} Trigger records by removing 'Trigger' suffix.");

        // Load jobs that have the "Trigger" suffix in their TriggerType
        var jobs = await workspaceDbContext.Jobs.IgnoreQueryFilters().ToListAsync();

        // Update the TriggerType of each job by removing the "Trigger" suffix
        foreach (var job in jobs)
        {
            switch (job.TriggerType)
            {
                case TriggerTypesEnum.ManualTrigger:
                    job.TriggerType = TriggerTypesEnum.Manual;
                    break;
                case TriggerTypesEnum.APITrigger:
                    job.TriggerType = TriggerTypesEnum.Api;
                    break;
                case TriggerTypesEnum.WebhookTrigger:
                    job.TriggerType = TriggerTypesEnum.Webhook;
                    break;
                case TriggerTypesEnum.QueueTrigger:
                    job.TriggerType = TriggerTypesEnum.Queue;
                    break;
                case TriggerTypesEnum.EventTrigger:
                    job.TriggerType = TriggerTypesEnum.Event;
                    break;
                case TriggerTypesEnum.TimeTrigger:
                    job.TriggerType = TriggerTypesEnum.Time;
                    break;
                case TriggerTypesEnum.EmailTrigger:
                    job.TriggerType = TriggerTypesEnum.Email;
                    break;
                case TriggerTypesEnum.MessageTrigger:
                    job.TriggerType = TriggerTypesEnum.Message;
                    break;
                default:
                    // If the trigger type does not have a "Trigger" suffix, do nothing
                    break;
            }
        }

        // Save changes to the database
        await workspaceDbContext.SaveChangesAsync();
        Console.WriteLine($"Info: Updated {jobs.Count} Job records by removing 'Trigger' suffix.");
    }
}