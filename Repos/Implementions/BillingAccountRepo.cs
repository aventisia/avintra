namespace AccountsAPIs.Repos;

public class BillingAccountRepo(AccountsDbContext accountsDbContext) : RepositoryBase<BillingAccount, AccountsDbContext>(accountsDbContext), IBillingAccountRepo
{
}