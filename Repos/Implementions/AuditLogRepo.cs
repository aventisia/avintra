namespace AccountsAPIs.Repos;

public class AuditLogRepo : RepositoryBase<AuditLog,AccountsDbContext>, IAuditLogRepo
{
    public AuditLogRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}