namespace AccountsAPIs.Repos;

public class CreditPlanRepo : RepositoryBase<CreditPlan, AccountsDbContext>, ICreditPlanRepo
{
    public CreditPlanRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}