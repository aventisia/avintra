namespace AccountsAPIs.Repos;

public class BillingHistoryRepo : RepositoryBase<BillingHistory, AccountsDbContext>, IBillingHistoryRepo
{
    public BillingHistoryRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}