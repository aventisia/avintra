namespace AccountsAPIs.Repos;

public class PlanRepo : RepositoryBase<Plan,AccountsDbContext>, IPlanRepo
{
    public PlanRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}