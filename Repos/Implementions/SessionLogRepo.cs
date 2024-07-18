namespace AccountsAPIs.Repos;

public class SessionLogRepo : RepositoryBase<SessionLog, AccountsDbContext>, ISessionLogRepo
{
    public SessionLogRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}