namespace GlobalAdminAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly GlobalAdminDbContext _globalAdminDbContext;
    public UnitOfWork(GlobalAdminDbContext globalAdminDbContext)
    {
        _globalAdminDbContext = globalAdminDbContext;
    }

    public IOnPremTenantRepo OnPremTenantRepo => new OnPremTenantRepo(_globalAdminDbContext);
    public IOnPremInstanceRepo OnPremInstanceRepo => new OnPremInstanceRepo(_globalAdminDbContext);
    public IOnPremInstanceDataRepo OnPremInstanceDataRepo => new OnPremInstanceDataRepo(_globalAdminDbContext);

    public async Task<bool> SaveAsync(bool checkHasChanges = false)
    {
        // Check change tracker first 
        if (checkHasChanges)
        {
            return _globalAdminDbContext.ChangeTracker.HasChanges()
                ? await _globalAdminDbContext.SaveChangesAsync() > 0
                : true;
        }

        // Save changes without checking change tracker
        return await _globalAdminDbContext.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return _globalAdminDbContext.ChangeTracker.HasChanges();
    }
}
