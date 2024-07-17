namespace AccountsAPIs.Repos;

public class SessionLogRepo : RepositoryBase<SessionLog, AccountsDbContext>, ISessionLogRepo
{
    private readonly IMapper _mapper;

    public SessionLogRepo(AccountsDbContext accountsDbContext, IMapper mapper) : base(accountsDbContext)
    {
        _mapper = mapper;
    }
}