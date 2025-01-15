namespace AccountsAPIs.Repos;

public class InvoiceRepo : RepositoryBase< Invoice,AccountsDbContext> , IInvoiceRepo
{
    public InvoiceRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
        
    }
}