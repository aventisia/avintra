namespace AccountsAPIs.Repos;

public class AccountUserRepo(AccountsDbContext accountsDbContext) : RepositoryBase<AccountUser, AccountsDbContext>(accountsDbContext), IAccountUserRepo
{
    private readonly AccountsDbContext _accountsDbContext = accountsDbContext;

    public override IQueryable<AccountUser> GetByConditionAsync(Expression<Func<AccountUser, bool>> expression)
    {
        return _accountsDbContext.Users
            .Include(i => i.Tenant).Include(i => i.UserRoles).ThenInclude(i => i.Role).Where(expression).AsNoTracking();
    }

}