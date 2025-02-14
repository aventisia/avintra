namespace AccountsAPIs.Repos;

public class AuditLogRepo(AccountsDbContext accountsDbContext) : RepositoryBase<AuditLog, AccountsDbContext>(accountsDbContext), IAuditLogRepo
{
}