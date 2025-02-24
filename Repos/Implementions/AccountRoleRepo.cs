namespace AccountsAPIs.Repos;

public class AccountRoleRepo : RepositoryBase<AccountRole, AccountsDbContext>, IAccountRoleRepo
{
    private readonly AccountsDbContext _accountsDbContext;
    
    public AccountRoleRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        _accountsDbContext = accountsDbContext;
    }

}