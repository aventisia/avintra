namespace AccountsAPIs.Repos;

public class TenantSubscriptionRepo : RepositoryBase<TenantSubscription, AccountsDbContext>, ITenantSubscriptionRepo
{
    public TenantSubscriptionRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}