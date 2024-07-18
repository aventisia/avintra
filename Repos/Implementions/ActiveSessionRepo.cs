namespace AccountsAPIs.Repos;

public class ActiveSessionRepo : RepositoryBase<ActiveSession, AccountsDbContext>, IActiveSessionRepo
{
    public ActiveSessionRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    
    }
}