namespace AccountsAPIs.Repos;

public class ContactUsRepo(AccountsDbContext accountsDbContext) : RepositoryBase<ContactUs, AccountsDbContext>(accountsDbContext), IContactUsRepo
{
}