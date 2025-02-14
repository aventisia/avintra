namespace AccountsAPIs.Repos;

public class PaymentRepo(AccountsDbContext accountsDbContext) : RepositoryBase<Payment,AccountsDbContext>(accountsDbContext),IPaymentRepo
{
}