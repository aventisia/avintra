namespace AccountsAPIs.Repos;

public class TenantRepo(AccountsDbContext accountsDbContext) : RepositoryBase<Tenant, AccountsDbContext>(accountsDbContext), ITenantRepo
{
}