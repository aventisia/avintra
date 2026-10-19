namespace AccountsAPIs.Services;

public class SearchByQueryService : ISearchByQueryService
{
    private readonly ILogger<SearchByQueryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public SearchByQueryService(
        ILogger<SearchByQueryService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;

        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
    }

    public async Task<ServiceResponse<IEnumerable<SearchedUserDto>>> SearchUserAsync(string? searchKey, bool includeCurrentUser, bool onlyCurrentSpace)
    {
        var serviceResponse = ServiceResponse<IEnumerable<SearchedUserDto>>.Create("Failed to search users", 500);

        try
        {
            var trimmedSearchKey = searchKey?.Trim() ?? string.Empty;

            IQueryable<AccountUser> accountUsersQuery = _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    !w.IsDefault &&
                    !w.IsDisabled &&
                    (includeCurrentUser || w.Id != _userId))
                .OrderBy(o => o.FirstName)
                .ThenBy(o => o.LastName);

            var currentSpaceId = _currentTenantService.CurrentSpaceId;

            if (onlyCurrentSpace && currentSpaceId != Guid.Empty)
            {
                var spaceUserIds = await _unitOfWork.SpaceUserRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == _tenantId &&
                        w.SpaceId == currentSpaceId &&
                        w.IsActive &&
                        !w.IsDisabled)
                    .Select(s => s.UserId)
                    .Distinct()
                    .ToListAsync();

                accountUsersQuery = accountUsersQuery.Where(w => spaceUserIds.Contains(w.Id));
            }

            if (string.IsNullOrWhiteSpace(trimmedSearchKey))
            {
                var topUsers = await accountUsersQuery
                    .Take(10)
                    .ProjectToType<SearchedUserDto>()
                    .AsNoTracking()
                    .ToListAsync();

                return serviceResponse.Update("Users retrieved successfully.", 200, topUsers);
            }

            var users = await accountUsersQuery
                .Where(w =>
                    w.FirstName.ToLower().Contains(trimmedSearchKey.ToLower()) ||
                    w.LastName.ToLower().Contains(trimmedSearchKey.ToLower()) ||
                    w.UserName.ToLower().Contains(trimmedSearchKey.ToLower()))
                .ProjectToType<SearchedUserDto>()
                .AsNoTracking()
                .ToListAsync();

            return serviceResponse.Update("Users retrieved successfully.", 200, users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while searching users.");
            return serviceResponse;
        }
    }
}
