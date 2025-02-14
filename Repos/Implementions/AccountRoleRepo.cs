namespace AccountsAPIs.Repos;

public class AccountRoleRepo(AccountsDbContext accountsDbContext) : RepositoryBase<AccountRole, AccountsDbContext>(accountsDbContext), IAccountRoleRepo
{
    private readonly AccountsDbContext _accountsDbContext = accountsDbContext;
}