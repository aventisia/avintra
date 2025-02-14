namespace AccountsAPIs.Repos;

public class ObsoletePwdRepo(AccountsDbContext accountsDbContext) : RepositoryBase<ObsoletePwd, AccountsDbContext>(accountsDbContext), IObsoletePwdRepo
{
}