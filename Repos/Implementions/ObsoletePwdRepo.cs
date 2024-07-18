namespace AccountsAPIs.Repos;

public class ObsoletePwdRepo : RepositoryBase<ObsoletePwd, AccountsDbContext>, IObsoletePwdRepo
{
    public ObsoletePwdRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}