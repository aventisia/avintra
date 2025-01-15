namespace AccountsAPIs.Repos;

public class BillingAccountRepo : RepositoryBase<BillingAccount, AccountsDbContext>, IBillingAccountRepo
{
    public BillingAccountRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}