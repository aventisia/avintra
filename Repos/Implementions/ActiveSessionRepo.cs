namespace AccountsAPIs.Repos;

public class ActiveSessionRepo : RepositoryBase<ActiveSession, AccountsDbContext>, IActiveSessionRepo
{
    private readonly IMapper _mapper;

    public ActiveSessionRepo(AccountsDbContext accountsDbContext, IMapper mapper) : base(accountsDbContext)
    {
        _mapper = mapper;
    }
}