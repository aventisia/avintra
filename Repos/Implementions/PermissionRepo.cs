namespace AccountsAPIs.Repos;

public class PermissionRepo : RepositoryBase<Permission, AccountsDbContext>, IPermissionRepo
{
    public PermissionRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}