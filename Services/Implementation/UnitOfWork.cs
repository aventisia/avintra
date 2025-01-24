using MLModelBuilderAPIs.Data;

namespace MLModelBuilderAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly MLModelBuilderDbContext _mlModelBuilderDbContext;
    public UnitOfWork(
        MLModelBuilderDbContext mlModelBuilderDbContext)
    {
        _mlModelBuilderDbContext = mlModelBuilderDbContext;
    }



    public async Task<bool> SaveAsync(bool checkHasChanges = false)
    {
        // Check change tracker first 
        if (checkHasChanges)
        {
            return _mlModelBuilderDbContext.ChangeTracker.HasChanges()
                ? await _mlModelBuilderDbContext.SaveChangesAsync() > 0
                : true;
        }

        // Save changes without checking change tracker
        return await _mlModelBuilderDbContext.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return _mlModelBuilderDbContext.ChangeTracker.HasChanges();
    }
}