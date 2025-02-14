namespace AccountsAPIs.Repos;

public class PermissionRepo(AccountsDbContext accountsDbContext) : RepositoryBase<Permission, AccountsDbContext>(accountsDbContext), IPermissionRepo
{
}