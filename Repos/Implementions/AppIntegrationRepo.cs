namespace AccountsAPIs.Repos;

public class AppIntegrationRepo : RepositoryBase<AppIntegration, AccountsDbContext>, IAppIntegrationRepo
{
    public AppIntegrationRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}