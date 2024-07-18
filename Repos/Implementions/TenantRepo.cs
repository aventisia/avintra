namespace AccountsAPIs.Repos;

public class TenantRepo : RepositoryBase<Tenant, AccountsDbContext>, ITenantRepo
{
    public TenantRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}