namespace AccountsAPIs.Repos;

public class PaymentRepo: RepositoryBase<Payment,AccountsDbContext>,IPaymentRepo
{
public PaymentRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
{
    
}
}