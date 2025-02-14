namespace AccountsAPIs.Repos;

public class ActiveSessionRepo(AccountsDbContext accountsDbContext) : RepositoryBase<ActiveSession, AccountsDbContext>(accountsDbContext), IActiveSessionRepo
{
}