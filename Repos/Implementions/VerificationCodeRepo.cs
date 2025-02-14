namespace AccountsAPIs.Repos;

public class VerificationCodeRepo(AccountsDbContext accountsDbContext) : RepositoryBase<VerificationCode, AccountsDbContext>(accountsDbContext), IVerificationCodeRepo
{
}