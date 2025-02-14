namespace AccountsAPIs.Repos;

public class InvoiceRepo(AccountsDbContext accountsDbContext) : RepositoryBase< Invoice,AccountsDbContext>(accountsDbContext) , IInvoiceRepo
{
}