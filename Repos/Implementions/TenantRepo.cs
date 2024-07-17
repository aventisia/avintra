namespace AccountsAPIs.Repos;

public class TenantRepo : RepositoryBase<Tenant, AccountsDbContext>, ITenantRepo
{
    private readonly IMapper _mapper;

    public TenantRepo(AccountsDbContext accountsDbContext, IMapper mapper) : base(accountsDbContext)
    {
        _mapper = mapper;
    }
}