namespace WorkspaceAPIs.Services;

public class UiBuilderProjectUserService : IUiBuilderProjectUserService
{
    private readonly ILogger<UiBuilderProjectUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public UiBuilderProjectUserService(
        ILogger<UiBuilderProjectUserService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>> GetMyUiBuilderProjectUsersAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>.Create("Failed to retrieve your UI builder projects at this time", 400);

        try
        {
            var uiBuilderProjectUsers = await _unitOfWork.UiBuilderProjectUserRepo
                .GetByConditionAsync(w => w.UserId == _userId)
                .Include(i => i.User)
                .Include(i => i.UiBuilderProject)
                .ProjectToType<UiBuilderProjectUserDto>()
                .ToListAsync();

            serviceResponse.Update("UI builder projects retrieved successfully", 200, uiBuilderProjectUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>> GetUiBuilderProjectUsersAsync(Guid uiBuilderProjectId)
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>.Create("Failed to retrieve users for the selected UI builder project", 400);

        try
        {
            var uiBuilderProjectUsers = await _unitOfWork.UiBuilderProjectUserRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == uiBuilderProjectId)
                .Include(i => i.User)
                .Include(i => i.UiBuilderProject)
                .ProjectToType<UiBuilderProjectUserDto>()
                .ToListAsync();

            serviceResponse.Update("Users retrieved successfully", 200, uiBuilderProjectUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectUserDto>> GetUiBuilderProjectUserByIdAsync(Guid uiBuilderProjectUserId)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectUserDto>.Create("Failed to retrieve the requested user. Please try again", 400);

        try
        {
            var uiBuilderProjectUser = await _unitOfWork.UiBuilderProjectUserRepo
                .GetByConditionAsync(w => w.Id == uiBuilderProjectUserId)
                .Include(i => i.User)
                .Include(i => i.UiBuilderProject)
                .ProjectToType<UiBuilderProjectUserDto>()
                .SingleOrDefaultAsync();

            serviceResponse.Update("User retrieved successfully", 200, uiBuilderProjectUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectUserDto>> InsertUiBuilderProjectUserAsync(UiBuilderProjectUserDto uiBuilderProjectUserDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectUserDto>.Create("Failed to create UI builder project user. Please try again", 400);

        try
        {
            var project = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.Id == uiBuilderProjectUserDto.UiBuilderProjectId && w.IsPublished)
                .FirstOrDefaultAsync();

            if (project == null)
            {
                _logger.LogWarning("Published UI builder project not found. UiBuilderProjectId: {UiBuilderProjectId}", uiBuilderProjectUserDto.UiBuilderProjectId);
                serviceResponse.Update("UI builder project not found", 404);
                return serviceResponse;
            }

            if (uiBuilderProjectUserDto.IsAssignedToAllUsers)
            {
                if (!project.IsPublishedTenantWide)
                {
                    project.IsPublishedTenantWide = true;
                    project.LastModifiedByUserId = _userId;
                    _unitOfWork.UiBuilderProjectRepo.Update(project);
                }

                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }

                serviceResponse.Update("UI builder project assigned to all users successfully", 200);
                return serviceResponse;
            }

            if (project.IsPublishedTenantWide)
            {
                project.IsPublishedTenantWide = false;
                project.LastModifiedByUserId = _userId;
                _unitOfWork.UiBuilderProjectRepo.Update(project);

                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }

                if (uiBuilderProjectUserDto.UserId == Guid.Empty)
                {
                    serviceResponse.Update("UI builder project revoked from tenant-wide access successfully", 200);
                    return serviceResponse;
                }
            }

            var existingUiBuilderProjectUser = await _unitOfWork.UiBuilderProjectUserRepo
                .GetByConditionAsync(w =>
                    w.UiBuilderProjectId == uiBuilderProjectUserDto.UiBuilderProjectId &&
                    w.UserId == uiBuilderProjectUserDto.UserId)
                .FirstOrDefaultAsync();

            if (existingUiBuilderProjectUser != null)
            {
                serviceResponse.Update("UI builder project user already exists", 409);
                return serviceResponse;
            }

            var workspaceUser = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => w.Id == uiBuilderProjectUserDto.UserId)
                .FirstOrDefaultAsync();

            if (workspaceUser == null)
            {
                _logger.LogWarning("WorkspaceUser not found. UserId: {UserId}", uiBuilderProjectUserDto.UserId);
                serviceResponse.Update("Workspace user not found", 404);
                return serviceResponse;
            }

            var uiBuilderProjectUser = uiBuilderProjectUserDto.Adapt<UiBuilderProjectUser>();

            await _unitOfWork.UiBuilderProjectUserRepo.InsertAsync(uiBuilderProjectUser);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update("UI builder project user created successfully", 200, uiBuilderProjectUser.Adapt<UiBuilderProjectUserDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>> BulkInsertUiBuilderProjectUsersAsync(IEnumerable<UiBuilderProjectUserDto> uiBuilderProjectUserDtos)
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderProjectUserDto>>.Create("Failed to create UI builder project users. Please try again", 400);

        try
        {
            if (uiBuilderProjectUserDtos == null || !uiBuilderProjectUserDtos.Any())
            {
                serviceResponse.Update("No users provided", 400);
                return serviceResponse;
            }

            var uiBuilderProjectIds = uiBuilderProjectUserDtos.Select(x => x.UiBuilderProjectId).Distinct().ToList();

            var projects = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => uiBuilderProjectIds.Contains(w.Id))
                .ToListAsync();

            if (projects.Count != uiBuilderProjectIds.Count || projects.Any(project => !project.IsPublished))
            {
                _logger.LogWarning("Published UI builder project not found for bulk assignment. ProjectIds: {ProjectIds}", string.Join(",", uiBuilderProjectIds));
                serviceResponse.Update("UI builder project not found", 404);
                return serviceResponse;
            }

            var assignToAllUsersProjectIds = uiBuilderProjectUserDtos
                .Where(dto => dto.IsAssignedToAllUsers)
                .Select(dto => dto.UiBuilderProjectId)
                .ToHashSet();

            var tenantWideAssigned = false;

            foreach (var project in projects.Where(project => assignToAllUsersProjectIds.Contains(project.Id) && !project.IsPublishedTenantWide))
            {
                project.IsPublishedTenantWide = true;
                project.LastModifiedByUserId = _userId;
                _unitOfWork.UiBuilderProjectRepo.Update(project);
                tenantWideAssigned = true;
            }

            var userDtos = uiBuilderProjectUserDtos.Where(dto => !dto.IsAssignedToAllUsers).ToList();
            var userIds = userDtos.Select(x => x.UserId).Distinct().ToList();

            var existingUiBuilderProjectUsers = await _unitOfWork.UiBuilderProjectUserRepo
                .GetByConditionAsync(w =>
                    uiBuilderProjectIds.Contains(w.UiBuilderProjectId) &&
                    userIds.Contains(w.UserId))
                .Select(s => new { s.UiBuilderProjectId, s.UserId })
                .ToListAsync();

            var newUiBuilderProjectUserDtos = userDtos
                .Where(w => !existingUiBuilderProjectUsers.Any(existing =>
                    existing.UiBuilderProjectId == w.UiBuilderProjectId &&
                    existing.UserId == w.UserId))
                .ToList();

            if (!newUiBuilderProjectUserDtos.Any())
            {
                if (!tenantWideAssigned)
                {
                    serviceResponse.Update("All UI builder project users already exist", 200);
                    return serviceResponse;
                }

                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }

                serviceResponse.Update("UI builder project assigned to all users successfully", 200);
                return serviceResponse;
            }

            var newUiBuilderProjectUsers = newUiBuilderProjectUserDtos
                .Select(dto => dto.Adapt<UiBuilderProjectUser>())
                .ToList();

            await _unitOfWork.UiBuilderProjectUserRepo.InsertAsync(newUiBuilderProjectUsers);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update($"{newUiBuilderProjectUsers.Count} UI builder project users created successfully", 200, newUiBuilderProjectUsers.Adapt<List<UiBuilderProjectUserDto>>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectUserDto>> UpdateUiBuilderProjectUserAsync(UiBuilderProjectUserDto uiBuilderProjectUserDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectUserDto>.Create("Failed to update UI builder project user. Please try again", 400);

        try
        {
            var uiBuilderProjectUser = await _unitOfWork.UiBuilderProjectUserRepo
                .GetByConditionAsync(w => w.Id == uiBuilderProjectUserDto.Id)
                .SingleOrDefaultAsync();

            if (uiBuilderProjectUser == null)
            {
                serviceResponse.Update("UI builder project user not found", 404);
                return serviceResponse;
            }

            uiBuilderProjectUserDto.Adapt(uiBuilderProjectUser);
            _unitOfWork.UiBuilderProjectUserRepo.Update(uiBuilderProjectUser);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update("UI builder project user updated successfully", 200, uiBuilderProjectUser.Adapt<UiBuilderProjectUserDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> DeleteUiBuilderProjectUserAsync(Guid uiBuilderProjectUserId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete UI builder project user. Please try again", 400, false);

        try
        {
            var uiBuilderProjectUser = await _unitOfWork.UiBuilderProjectUserRepo
                .GetByConditionAsync(x => x.Id == uiBuilderProjectUserId)
                .SingleOrDefaultAsync();

            if (uiBuilderProjectUser == null)
            {
                serviceResponse.Update("User not found", 404);
                return serviceResponse;
            }

            _unitOfWork.UiBuilderProjectUserRepo.Delete(uiBuilderProjectUser);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update("UI builder project user deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> DeleteUiBuilderProjectUsersAsync(IEnumerable<Guid> uiBuilderProjectUserIds)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete UI builder project users. Please try again", 400, false);

        try
        {
            var uiBuilderProjectUsers = await _unitOfWork.UiBuilderProjectUserRepo
                .GetByConditionAsync(w => uiBuilderProjectUserIds.Contains(w.Id))
                .ToListAsync();

            if (!uiBuilderProjectUsers.Any())
            {
                serviceResponse.Update("No UI builder project users found", 404);
                return serviceResponse;
            }

            _unitOfWork.UiBuilderProjectUserRepo.Delete(uiBuilderProjectUsers);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update($"{uiBuilderProjectUsers.Count} UI builder project users deleted", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}
