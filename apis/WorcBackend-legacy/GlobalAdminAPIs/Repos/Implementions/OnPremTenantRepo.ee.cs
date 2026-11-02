namespace GlobalAdminAPIs.Repos;

public class OnPremTenantRepo : RepositoryBase<OnPremTenant, GlobalAdminDbContext>, IOnPremTenantRepo
{
    public OnPremTenantRepo(GlobalAdminDbContext globalAdminDbContext) : base(globalAdminDbContext)
    {
    }
}