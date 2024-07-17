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

    public override IQueryable<AccountUser> GetByConditionAsync(Expression<Func<AccountUser, bool>> expression)
    {
        return _accountsDbContext.Users
            .Include(i => i.Tenant).Include(i => i.UserRoles).ThenInclude(i => i.Role).Where(expression).AsNoTracking();
    }

}