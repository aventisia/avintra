namespace GlobalAdminAPIs.Repos;

public class OnPremInstanceDataRepo : RepositoryBase<OnPremInstanceData, GlobalAdminDbContext>, IOnPremInstanceDataRepo
{
    public OnPremInstanceDataRepo(GlobalAdminDbContext globalAdminDbContext) : base(globalAdminDbContext)
    {
    }
}