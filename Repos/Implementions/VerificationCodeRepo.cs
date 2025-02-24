namespace AccountsAPIs.Repos;

public class VerificationCodeRepo : RepositoryBase<VerificationCode, AccountsDbContext>, IVerificationCodeRepo
{
    public VerificationCodeRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    
    }
}