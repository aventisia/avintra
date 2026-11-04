// For more info on How to seed data, watch YT video: https://www.youtube.com/watch?v=0B7QjRSvcGI
namespace GlobalAdminAPIs.Data;

public static class GlobalAdminDbInitialSeed
{
    public async static Task<WebApplication> SeedInitialData(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            // Get globalAdminDbContext
            using var _globalAdminDbContext = scope.ServiceProvider.GetRequiredService<GlobalAdminDbContext>();

            // Apply pending database migrations
            await ApplyMigrationsAsync(_globalAdminDbContext);

            return app;
        }
    }

    // Apply pending database migrations
    private async static Task ApplyMigrationsAsync(GlobalAdminDbContext globalAdminDbContext)
    {
        try
        {
            Console.WriteLine("Info: Applying database migrations...");
            await globalAdminDbContext.Database.MigrateAsync();
            Console.WriteLine("Info: Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: An error occurred while applying database migrations: {ex.Message}");
            throw;
        }
    }
}