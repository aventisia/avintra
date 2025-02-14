namespace AccountsAPIs.Repos;

public class SubscriptionRepo(AccountsDbContext accountsDbContext) : RepositoryBase<Subscription, AccountsDbContext>(accountsDbContext), ISubscriptionRepo
{
}