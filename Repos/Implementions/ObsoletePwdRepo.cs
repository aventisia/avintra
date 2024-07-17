namespace AccountsAPIs.Repos;

public class ObsoletePwdRepo : RepositoryBase<ObsoletePwd, AccountsDbContext>, IObsoletePwdRepo
{
    private readonly IMapper _mapper;

    public ObsoletePwdRepo(AccountsDbContext accountsDbContext, IMapper mapper) : base(accountsDbContext)
    {
        _mapper = mapper;
    }
}