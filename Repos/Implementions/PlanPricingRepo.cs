namespace AccountsAPIs.Repos;

public class PlanPricingRepo : RepositoryBase<PlanPricing,AccountsDbContext>, IPlanPricingRepo
{
    public PlanPricingRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}