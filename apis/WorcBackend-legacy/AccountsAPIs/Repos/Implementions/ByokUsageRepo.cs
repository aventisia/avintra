namespace AccountsAPIs.Repos;

public class ByokUsageRepo : RepositoryBase<ByokUsage, AccountsDbContext>, IByokUsageRepo
{
    public ByokUsageRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}
