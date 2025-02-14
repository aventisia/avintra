namespace AccountsAPIs.Repos;

public class SessionLogRepo(AccountsDbContext accountsDbContext) : RepositoryBase<SessionLog, AccountsDbContext>(accountsDbContext), ISessionLogRepo
{
}