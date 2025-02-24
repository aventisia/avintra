namespace AccountsAPIs.Repos;

public class SubscriptionRepo : RepositoryBase<Subscription, AccountsDbContext>, ISubscriptionRepo
{
    public SubscriptionRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}