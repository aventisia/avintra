namespace AccountsAPIs.Repos;

public class ContactUsRepo : RepositoryBase<ContactUs, AccountsDbContext>, IContactUsRepo
{
    public ContactUsRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {

    }
}