namespace AccountsAPIs.Repos;

public class PricingPlanRepo : RepositoryBase<PlanPricing,AccountsDbContext>, IPricingPlanRepo
{
    public PricingPlanRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}