namespace AccountsAPIs.Repos;

public class LicenseCreditRepo : RepositoryBase<LicenseCredit, AccountsDbContext>, ILicenseCreditRepo
{
    private readonly AccountsDbContext _accountsDbContext;
    
    public LicenseCreditRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        _accountsDbContext = accountsDbContext;
    }

}