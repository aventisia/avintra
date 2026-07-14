namespace AccountsAPIs.Repos;

public class EmailCampaignRepo : RepositoryBase<EmailCampaign, AccountsDbContext>, IEmailCampaignRepo
{
    public EmailCampaignRepo(AccountsDbContext accountsDbContext) : base(accountsDbContext)
    {
    }
}
