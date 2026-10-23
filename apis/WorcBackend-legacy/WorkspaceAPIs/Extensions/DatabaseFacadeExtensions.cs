using Microsoft.EntityFrameworkCore.Infrastructure;

namespace WorkspaceAPIs.Extensions;

public static class DatabaseFacadeExtensions
{
    /// <summary>
    /// Runs the operation in one transaction: commit on success, roll back when it throws.
    /// </summary>
    public static async Task ExecuteInTransactionAsync(this DatabaseFacade database, Func<Task> operation)
    {
        await using var transaction = await database.BeginTransactionAsync();
        try
        {
            await operation();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Acquires a transaction-scoped PostgreSQL advisory lock for a logical resource key.
    /// </summary>
    public static Task AcquireAdvisoryLockAsync(this DatabaseFacade database, string resourceKey)
    {
        return database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock(hashtextextended({resourceKey}, 0))");
    }
}
