namespace AccountsAPIs.Services;

public class TenantAccountService : ITenantAccountService
{
    private readonly ILogger<TenantAccountService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TenantAccountService(
        ILogger<TenantAccountService> logger,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    // acccounts-api/tenant/user/
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/delete-user/
}