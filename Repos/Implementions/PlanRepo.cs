namespace AccountsAPIs.Repos;

public class PlanRepo : RepositoryBase<PlanPricing,AccountsDbContext>, IPlanRepo
{
    public PlanRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}