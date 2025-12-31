namespace AccountsAPIs.Repos;

public class CreditUsageRepo : RepositoryBase<CreditUsage, AccountsDbContext>, ICreditUsageRepo
{
    public CreditUsageRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}