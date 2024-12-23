namespace AccountsAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly AccountsDbContext _accountsDbContext;
    public UnitOfWork(
        AccountsDbContext accountsDbContext)
    {
        _accountsDbContext = accountsDbContext;
    }

    public IAccountUserRepo AccountUserRepo => new AccountUserRepo(_accountsDbContext);
    public ITenantRepo TenantRepo => new TenantRepo(_accountsDbContext);
    public IActiveSessionRepo ActiveSessionRepo => new ActiveSessionRepo(_accountsDbContext);
    public ISessionLogRepo SessionLogRepo => new SessionLogRepo(_accountsDbContext);
    public IObsoletePwdRepo ObsoletePwdRepo => new ObsoletePwdRepo(_accountsDbContext);
    public IVerificationCodeRepo VerificationCodeRepo => new VerificationCodeRepo(_accountsDbContext);
    public ISubscriptionRepo SubscriptionRepo => new SubscriptionRepo(_accountsDbContext);
    public IAccountRoleRepo AccountRoleRepo => new AccountRoleRepo(_accountsDbContext);
    public IPermissionRepo PermissionRepo => new PermissionRepo(_accountsDbContext);
    public IRolePermissionRepo RolePermissionRepo => new RolePermissionRepo(_accountsDbContext);





    public async Task<bool> SaveAsync(bool checkHasChanges = false)
    {
        // Check change tracker first 
        if (checkHasChanges)
        {
            return _accountsDbContext.ChangeTracker.HasChanges()
                ? await _accountsDbContext.SaveChangesAsync() > 0
                : true;
        }
        
        // Save changes without checking change tracker
        return await _accountsDbContext.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return _accountsDbContext.ChangeTracker.HasChanges();
    }
}
