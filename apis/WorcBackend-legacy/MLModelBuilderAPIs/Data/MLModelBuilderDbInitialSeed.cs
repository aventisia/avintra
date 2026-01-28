// For more info on How to seed data, watch YT video: https://www.youtube.com/watch?v=0B7QjRSvcGI
namespace MLModelBuilderAPIs.Data;

public static class MLModelBuilderDbInitialSeed
{
    public async static Task<WebApplication> SeedInitialData(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            // Get mlModelBuilderDbContext
            using var _mlModelBuilderDbContext = scope.ServiceProvider.GetRequiredService<MLModelBuilderDbContext>();

            // Apply pending database migrations
            await ApplyMigrationsAsync(_mlModelBuilderDbContext);
            return app;
        }
    }

    // Apply pending database migrations
    private async static Task ApplyMigrationsAsync(MLModelBuilderDbContext mlModelBuilderDbContext)
    {
        try
        {
            Console.WriteLine("Info: Applying database migrations...");
            await mlModelBuilderDbContext.Database.MigrateAsync();
            Console.WriteLine("Info: Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: An error occurred while applying database migrations: {ex.Message}");
            throw;
        }
    }
}