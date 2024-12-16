namespace AccountsAPIs.Repos;

public class CustomRoleRepo : RepositoryBase<CustomRole, AccountsDbContext>, ICustomRoleRepo
{
    public CustomRoleRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}