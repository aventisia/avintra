namespace AccountsAPIs.Repos;

public class PaymentHistoryRepo: RepositoryBase<PaymentHistory,AccountsDbContext>,IPaymentHistoryRepo
{
public PaymentHistoryRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
{
    
}
}