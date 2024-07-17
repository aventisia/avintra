namespace AccountsAPIs.Repos;

public class VerificationCodeRepo : RepositoryBase<VerificationCode, AccountsDbContext>, IVerificationCodeRepo
{
    private readonly IMapper _mapper;

    public VerificationCodeRepo(AccountsDbContext accountsDbContext, IMapper mapper) : base(accountsDbContext)
    {
        _mapper = mapper;
    }
}