namespace AccountsAPIs.Repos;

public class AddressRepo(AccountsDbContext accountsDbContext) : RepositoryBase<Address, AccountsDbContext>(accountsDbContext), IAddressRepo
{
}