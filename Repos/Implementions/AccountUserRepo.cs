namespace AccountsAPIs.Repos;

public class AccountUserRepo : RepositoryBase<AccountUser, AccountsDbContext>, IAccountUserRepo
{
    private readonly AccountsDbContext _accountsDbContext;
    
    public AccountUserRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        _accountsDbContext = accountsDbContext;
    }

    public override IQueryable<AccountUser> GetByConditionAsync(Expression<Func<AccountUser, bool>> expression)
    {
        return _accountsDbContext.Users
            .Include(i => i.Tenant).Include(i => i.UserRoles).ThenInclude(i => i.Role).Where(expression).AsNoTracking();
    }

}