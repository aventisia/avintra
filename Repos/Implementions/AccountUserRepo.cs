namespace AccountsAPIs.Repos;

public class AccountUserRepo : RepositoryBase<AccountUser, AccountsDbContext>, IAccountUserRepo
{
    private readonly AccountsDbContext _accountsDbContext;
    private readonly IMapper _mapper;

    public AccountUserRepo(AccountsDbContext accountsDbContext, IMapper mapper) : base(accountsDbContext)
    {
        _accountsDbContext = accountsDbContext;
        _mapper = mapper;
    }
}