namespace AccountsAPIs.Repos;

public class PaymentMethodRepo: RepositoryBase<PaymentMethod,AccountsDbContext>,IPaymentMethodRepo
{
public PaymentMethodRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
{
    
}
}