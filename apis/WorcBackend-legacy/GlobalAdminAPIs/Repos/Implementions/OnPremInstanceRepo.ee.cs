namespace GlobalAdminAPIs.Repos;

public class OnPremInstanceRepo : RepositoryBase<OnPremInstance, GlobalAdminDbContext>, IOnPremInstanceRepo
{
    public OnPremInstanceRepo(GlobalAdminDbContext globalAdminDbContext) : base(globalAdminDbContext)
    {
    }
}