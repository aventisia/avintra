namespace AccountsAPIs.Repos;

public class BillingDetailRepo : RepositoryBase<BillingDetail, AccountsDbContext>, IBillingDetailRepo
{
    public BillingDetailRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}