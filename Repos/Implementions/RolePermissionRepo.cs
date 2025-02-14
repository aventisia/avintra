namespace AccountsAPIs.Repos;

public class RolePermissionRepo(AccountsDbContext accountsDbContext) : RepositoryBase<RolePermission, AccountsDbContext>(accountsDbContext), IRolePermissionRepo
{
}