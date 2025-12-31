namespace AccountsAPIs.Repos;

public class TenantCreditRepo : RepositoryBase<TenantCredit, AccountsDbContext>, ITenantCreditRepo
{
    public TenantCreditRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}