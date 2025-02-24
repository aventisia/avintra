namespace AccountsAPIs.Repos;

public class RolePermissionRepo : RepositoryBase<RolePermission, AccountsDbContext>, IRolePermissionRepo
{
    public RolePermissionRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}