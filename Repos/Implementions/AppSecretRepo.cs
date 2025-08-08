namespace AccountsAPIs.Repos;

public class AppSecretRepo : RepositoryBase<AppSecret, AccountsDbContext>, IAppSecretRepo
{
    public AppSecretRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}