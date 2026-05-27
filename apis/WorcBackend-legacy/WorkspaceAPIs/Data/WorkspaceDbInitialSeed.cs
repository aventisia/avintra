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

            // TODO (Remove ai-studio task): Temporary database data migration logic - remove once all dev/uat/prod database's data is updated

            // TODO (Remove ai-studio task): Remove AIProject record from ProjectTemplate entity
            var aiProjectTemplate = (await workspaceDbContext.ProjectTemplates.Where(w => w.Type == ProjectTemplateTypesEnum.AIProject).ToListAsync());
            if (aiProjectTemplate != null && aiProjectTemplate.Any())
            {
                workspaceDbContext.ProjectTemplates.RemoveRange(aiProjectTemplate);
                await workspaceDbContext.SaveChangesAsync();
                Console.WriteLine("Info: Removed AIProject type template from ProjectTemplates entity.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: An error occurred while applying database migrations: {ex.Message}");
            throw;
        }
    }
}