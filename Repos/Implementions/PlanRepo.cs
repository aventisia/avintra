namespace AccountsAPIs.Repos;

public class PlanRepo(AccountsDbContext accountsDbContext) : RepositoryBase<Plan,AccountsDbContext>(accountsDbContext), IPlanRepo
{
}