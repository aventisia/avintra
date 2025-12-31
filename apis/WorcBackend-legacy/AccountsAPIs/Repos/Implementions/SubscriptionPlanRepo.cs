namespace AccountsAPIs.Repos;

public class SubscriptionPlanRepo : RepositoryBase<SubscriptionPlan, AccountsDbContext>, ISubscriptionPlanRepo
{
    public SubscriptionPlanRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}