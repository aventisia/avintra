namespace AccountsAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly AccountsDbContext _accountsDbContext;
    private readonly IMapper _mapper;

    public UnitOfWork(
        AccountsDbContext accountsDbContext,
        IMapper mapper)
    {
        _accountsDbContext = accountsDbContext;
        _mapper = mapper;
    }

    public IAccountUserRepo AccountUserRepo => new AccountUserRepo(_accountsDbContext, _mapper);

    public ITenantRepo TenantRepo => new TenantRepo(_accountsDbContext, _mapper);

    public IActiveSessionRepo ActiveSessionRepo => new ActiveSessionRepo(_accountsDbContext, _mapper);

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
