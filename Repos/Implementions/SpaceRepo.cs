namespace AccountsAPIs.Repos;

public class SpaceRepo(AccountsDbContext accountsDbContext) : RepositoryBase<Space, AccountsDbContext>(accountsDbContext), ISpaceRepo
{
}