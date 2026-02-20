namespace AccountsAPIs.Repos;

public class SpaceUserRepo(AccountsDbContext accountsDbContext) : RepositoryBase<SpaceUser, AccountsDbContext>(accountsDbContext), ISpaceUserRepo
{
}