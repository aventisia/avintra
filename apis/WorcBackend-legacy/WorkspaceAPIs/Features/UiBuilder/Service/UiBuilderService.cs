namespace WorkspaceAPIs.Services;

public class UiBuilderService : IUiBuilderService
{
    private readonly ILogger<UiBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    public UiBuilderService(
        ILogger<UiBuilderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderProjectDto>>> GetUiBuilderProjectsAsync(bool isPersonal)
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderProjectDto>>.Create("Failed to retrieve projects. Please try again", 400);

        try
        {
            var projects = isPersonal
                ? await _unitOfWork.UiBuilderProjectRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                    .Include(i => i.UiBuilderVersions)
                    .Include(i => i.CreatedByUser)
                    .OrderByDescending(w => w.CreatedOn)
                    .ToListAsync()
                : await _unitOfWork.UiBuilderProjectRepo
                    .GetByConditionAsync(w => w.CreatedByUserId != _userId && w.IsTenantWideAccess)
                    .Include(i => i.UiBuilderVersions)
                    .Include(i => i.CreatedByUser)
                    .OrderByDescending(w => w.CreatedOn)
                    .ToListAsync();

            var projectDtoList = projects.Adapt<List<UiBuilderProjectDto>>();

            projectDtoList.ForEach(projectDto =>
                projectDto.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : ResourceAccessTypeEnum.View);

            serviceResponse.Data = projectDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Projects retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectDto>> GetUiBuilderProjectAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectDto>.Create("Failed to retrieve project. Please try again", 400);

        try
        {
            var project = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.Id == id)
                .Include(i => i.UiBuilderVersions)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            if (project == null || !HasReadAccess(project))
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            var projectDto = project.Adapt<UiBuilderProjectDto>();
            projectDto.AccessLevel = project.CreatedByUserId == _userId
                ? ResourceAccessTypeEnum.Owner
                : ResourceAccessTypeEnum.View;

            serviceResponse.Data = projectDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderVersionDto>>> GetUiBuilderVersionsAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderVersionDto>>.Create("Failed to retrieve versions. Please try again", 400);

        try
        {
            var project = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.Id == id)
                .SingleOrDefaultAsync();

            if (project == null || !HasReadAccess(project))
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            var versions = await _unitOfWork.UiBuilderVersionRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == id)
                .Include(i => i.CreatedByUser)
                .OrderByDescending(w => w.VersionNumber)
                .ToListAsync();

            serviceResponse.Data = versions.Adapt<IEnumerable<UiBuilderVersionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Versions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectDto>> InsertUiBuilderProjectAsync(UiBuilderProjectDto uiBuilderProjectDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectDto>.Create("Failed to insert project. Please try again", 400);

        try
        {
            var nameAlreadyExists = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == uiBuilderProjectDto.Name.ToLower())
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (nameAlreadyExists != null)
            {
                serviceResponse.Update("A project with same name already exists. Please enter a unique name", 409);
                return serviceResponse;
            }

            uiBuilderProjectDto = uiBuilderProjectDto.TrimDtoStringProps();

            var newProject = uiBuilderProjectDto.Adapt<UiBuilderProject>();
            newProject.CreatedByUserId = _userId;
            newProject.LastModifiedByUserId = _userId;

            await _unitOfWork.UiBuilderProjectRepo.InsertAsync(newProject);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            var projectDto = newProject.Adapt<UiBuilderProjectDto>();
            projectDto.AccessLevel = ResourceAccessTypeEnum.Owner;

            serviceResponse.Data = projectDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectDto>> UpdateUiBuilderProjectAsync(UiBuilderProjectDto uiBuilderProjectDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectDto>.Create("Failed to update project. Please try again", 400);

        try
        {
            var project = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.Id == uiBuilderProjectDto.Id)
                .SingleOrDefaultAsync();

            if (project == null)
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            if (project.CreatedByUserId != _userId)
            {
                _logger.LogWarning("Unauthorized project update. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to update this project.", 403);
                return serviceResponse;
            }

            uiBuilderProjectDto = uiBuilderProjectDto.TrimDtoStringProps();

            uiBuilderProjectDto.Adapt(project);
            project.LastModifiedByUserId = _userId;
            project.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.UiBuilderProjectRepo.Update(project);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Data = project.Adapt<UiBuilderProjectDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> DeleteUiBuilderProjectAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete project. Please try again", 400, false);

        try
        {
            var project = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.Id == id)
                .Include(i => i.UiBuilderVersions)
                .SingleOrDefaultAsync();

            if (project == null)
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            if (project.CreatedByUserId != _userId)
            {
                _logger.LogWarning("Unauthorized project delete. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to delete this project.", 403);
                return serviceResponse;
            }

            _unitOfWork.UiBuilderProjectRepo.Delete(project);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update("Project deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<int>> DeleteUiBuilderProjectsAsync(List<Guid> ids)
    {
        var serviceResponse = ServiceResponse<int>.Create("Failed to delete projects. Please try again", 400, 0);

        try
        {
            var projects = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => ids.Contains(w.Id))
                .Include(i => i.UiBuilderVersions)
                .ToListAsync();

            if (projects.Count == 0)
            {
                serviceResponse.Update("Projects do not exist", 404);
                return serviceResponse;
            }

            if (projects.Any(project => project.CreatedByUserId != _userId))
            {
                _logger.LogWarning("Unauthorized bulk project delete. User {UserId}", _userId);
                serviceResponse.Update("You do not have access to delete one or more projects.", 403);
                return serviceResponse;
            }

            _unitOfWork.UiBuilderProjectRepo.Delete(projects);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update($"{projects.Count} projects deleted successfully", 200, projects.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<TrueFalseResultDto>> IsUiBuilderNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = ServiceResponse<TrueFalseResultDto>.Create("Failed to check project name availability. Please try again", 400);

        try
        {
            var nameAlreadyExists = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (nameAlreadyExists != null)
            {
                serviceResponse.Update("A project with same name already exists. Please enter a unique name", 200, new TrueFalseResultDto { Result = false });
                return serviceResponse;
            }

            serviceResponse.Update("Project name is available", 200, new TrueFalseResultDto { Result = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderVersionDto>> InsertUiBuilderVersionAsync(Guid id, UiBuilderVersionDto uiBuilderVersionDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderVersionDto>.Create("Failed to insert version. Please try again", 400);

        try
        {
            var project = await GetWritableProjectAsync(id);
            if (project == null)
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            if (!HasWriteAccess(project))
            {
                _logger.LogWarning("Unauthorized version insert. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to update this project.", 403);
                return serviceResponse;
            }

            uiBuilderVersionDto = uiBuilderVersionDto.TrimDtoStringProps();

            var contentFormat = UiBuilderContentFormatHelpers.NormalizeContentFormat(uiBuilderVersionDto.ContentFormat);
            if (contentFormat == null)
            {
                serviceResponse.Update("Unsupported content format", 400);
                return serviceResponse;
            }

            if (contentFormat == UiBuilderContentFormatHelpers.Framework && string.IsNullOrWhiteSpace(uiBuilderVersionDto.SourceArtifact))
            {
                serviceResponse.Update("Framework versions require a source artifact", 400);
                return serviceResponse;
            }

            uiBuilderVersionDto.ContentFormat = contentFormat;
            uiBuilderVersionDto.SourceArtifact = contentFormat == UiBuilderContentFormatHelpers.Framework
                ? uiBuilderVersionDto.SourceArtifact
                : null;

            UiBuilderVersion? newVersion = null;

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                await _unitOfWork.AcquireAdvisoryLockAsync($"ui-builder-version:{project.Id}");

                var maxVersionNumber = await _unitOfWork.UiBuilderVersionRepo
                    .GetByConditionAsync(w => w.UiBuilderProjectId == project.Id)
                    .IgnoreQueryFilters()
                    .Select(w => (int?)w.VersionNumber)
                    .MaxAsync() ?? 0;

                newVersion = uiBuilderVersionDto.Adapt<UiBuilderVersion>();
                newVersion.UiBuilderProjectId = project.Id;
                newVersion.VersionNumber = maxVersionNumber + 1;
                newVersion.CreatedByUserId = _userId;
                newVersion.LastModifiedByUserId = _userId;

                await _unitOfWork.UiBuilderVersionRepo.InsertAsync(newVersion);

                if (!await _unitOfWork.SaveAsync())
                {
                    throw new InvalidOperationException("Failed to save version.");
                }
            });

            serviceResponse.Data = newVersion.Adapt<UiBuilderVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderVersionDto>> RestoreUiBuilderVersionAsync(Guid id, int versionNumber)
    {
        var serviceResponse = ServiceResponse<UiBuilderVersionDto>.Create("Failed to restore version. Please try again", 400);

        try
        {
            var project = await GetWritableProjectAsync(id);
            if (project == null)
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            if (!HasWriteAccess(project))
            {
                _logger.LogWarning("Unauthorized version restore. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to update this project.", 403);
                return serviceResponse;
            }

            var sourceVersion = await _unitOfWork.UiBuilderVersionRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == id && w.VersionNumber == versionNumber)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (sourceVersion == null)
            {
                serviceResponse.Update("Version does not exist", 404);
                return serviceResponse;
            }

            UiBuilderVersion? newVersion = null;

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                await _unitOfWork.AcquireAdvisoryLockAsync($"ui-builder-version:{project.Id}");

                var maxVersionNumber = await _unitOfWork.UiBuilderVersionRepo
                    .GetByConditionAsync(w => w.UiBuilderProjectId == project.Id)
                    .IgnoreQueryFilters()
                    .Select(w => (int?)w.VersionNumber)
                    .MaxAsync() ?? 0;

                newVersion = new UiBuilderVersion
                {
                    UiBuilderProjectId = project.Id,
                    VersionNumber = maxVersionNumber + 1,
                    PromptText = $"Restored from version {versionNumber}",
                    GeneratedHtml = sourceVersion.GeneratedHtml,
                    ContentFormat = sourceVersion.ContentFormat,
                    SourceArtifact = sourceVersion.SourceArtifact,
                    Provider = sourceVersion.Provider,
                    Model = sourceVersion.Model,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                };

                await _unitOfWork.UiBuilderVersionRepo.InsertAsync(newVersion);

                if (!await _unitOfWork.SaveAsync())
                {
                    throw new InvalidOperationException("Failed to save version.");
                }
            });

            serviceResponse.Data = newVersion.Adapt<UiBuilderVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version restored successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectDto>> PublishUiBuilderProjectAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectDto>.Create("Failed to publish project. Please try again", 400);

        try
        {
            var project = await GetWritableProjectAsync(id);
            if (project == null)
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            if (project.CreatedByUserId != _userId)
            {
                _logger.LogWarning("Unauthorized project publish. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to publish this project.", 403);
                return serviceResponse;
            }

            var versionCount = await _unitOfWork.UiBuilderVersionRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == id)
                .IgnoreQueryFilters()
                .CountAsync();

            if (versionCount == 0)
            {
                serviceResponse.Update("Publish requires at least one version", 400);
                return serviceResponse;
            }

            var isAlreadyPinned = false;

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                await _unitOfWork.AcquireAdvisoryLockAsync($"ui-builder-version:{project.Id}");

                var headVersionNumber = await _unitOfWork.UiBuilderVersionRepo
                    .GetByConditionAsync(w => w.UiBuilderProjectId == project.Id)
                    .IgnoreQueryFilters()
                    .Select(w => (int?)w.VersionNumber)
                    .MaxAsync() ?? 0;

                isAlreadyPinned = project.IsPublished && project.PublishedVersionNumber == headVersionNumber;
                if (isAlreadyPinned)
                {
                    return;
                }

                project.IsPublished = true;
                project.PublishedVersionNumber = headVersionNumber;
                project.LastModifiedByUserId = _userId;
                project.LastModifiedOn = DateTimeOffset.UtcNow;

                _unitOfWork.UiBuilderProjectRepo.Update(project);

                if (!await _unitOfWork.SaveAsync())
                {
                    throw new InvalidOperationException("Failed to save project.");
                }
            });

            if (isAlreadyPinned)
            {
                serviceResponse.Update("Project already published", 200, project.Adapt<UiBuilderProjectDto>());
                return serviceResponse;
            }

            serviceResponse.Update("Project published successfully", 200, project.Adapt<UiBuilderProjectDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderProjectDto>>> GetPublishedUiBuilderProjectsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderProjectDto>>.Create("Failed to retrieve published projects. Please try again", 400);

        try
        {
            var projects = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.IsPublished && !w.IsDisabled && w.PublishedVersionNumber != null)
                .AsNoTracking()
                .Include(i => i.UiBuilderVersions)
                .Include(i => i.CreatedByUser)
                .OrderByDescending(w => w.CreatedOn)
                .ToListAsync();

            var projectDtoList = projects.Adapt<List<UiBuilderProjectDto>>();

            projectDtoList.ForEach(projectDto => projectDto.AccessLevel = ResourceAccessTypeEnum.View);

            serviceResponse.Update("Published projects retrieved successfully", 200, projectDtoList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderProjectDto>>> GetMyUiBuilderProjectsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderProjectDto>>.Create("Failed to retrieve assigned projects. Please try again", 400);

        try
        {
            var projects = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w =>
                    w.IsPublished &&
                    !w.IsDisabled &&
                    w.PublishedVersionNumber != null &&
                    (w.IsPublishedTenantWide ||
                        (w.UiBuilderProjectUsers != null && w.UiBuilderProjectUsers.Any(user => user.UserId == _userId))))
                .AsNoTracking()
                .Include(i => i.UiBuilderVersions)
                .Include(i => i.CreatedByUser)
                .OrderByDescending(w => w.CreatedOn)
                .ToListAsync();

            var projectDtoList = projects.Adapt<List<UiBuilderProjectDto>>();

            projectDtoList.ForEach(projectDto => projectDto.AccessLevel = ResourceAccessTypeEnum.View);

            serviceResponse.Update("Assigned projects retrieved successfully", 200, projectDtoList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectViewDto>> GetPublishedUiBuilderViewAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectViewDto>.Create("Failed to retrieve interface. Please try again", 400);

        try
        {
            var project = await GetVisiblePublishedProjectAsync(id, true);
            if (project == null)
            {
                serviceResponse.Update("Interface does not exist", 404);
                return serviceResponse;
            }

            var pinnedVersion = await GetPublishedVersionAsync(project);
            if (pinnedVersion == null)
            {
                serviceResponse.Update("No version available", 404);
                return serviceResponse;
            }

            serviceResponse.Update("Interface retrieved successfully", 200, BuildPublishedView(project, pinnedVersion));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectViewDto>> GetOmUiBuilderViewAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectViewDto>.Create("Failed to retrieve interface. Please try again", 400);

        try
        {
            var project = await GetVisiblePublishedProjectAsync(id, false);
            if (project == null)
            {
                serviceResponse.Update("Interface does not exist", 404);
                return serviceResponse;
            }

            var pinnedVersion = await GetPublishedVersionAsync(project);
            if (pinnedVersion == null)
            {
                serviceResponse.Update("No version available", 404);
                return serviceResponse;
            }

            serviceResponse.Update("Interface retrieved successfully", 200, BuildPublishedView(project, pinnedVersion));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    private async Task<UiBuilderProject?> GetVisiblePublishedProjectAsync(Guid id, bool enforceAssignment)
    {
        var project = await _unitOfWork.UiBuilderProjectRepo
            .GetByConditionAsync(w => w.Id == id)
            .Include(i => i.UiBuilderVersions)
            .Include(i => i.CreatedByUser)
            .SingleOrDefaultAsync();

        if (project == null || !project.IsPublished || project.PublishedVersionNumber == null || project.IsDisabled)
        {
            return null;
        }

        if (enforceAssignment && !project.IsPublishedTenantWide)
        {
            var isAssigned = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.Id == id && w.UiBuilderProjectUsers != null && w.UiBuilderProjectUsers.Any(user => user.UserId == _userId))
                .AnyAsync();

            if (!isAssigned)
            {
                return null;
            }
        }

        return project;
    }

    private async Task<UiBuilderVersion?> GetPublishedVersionAsync(UiBuilderProject project)
    {
        if (project.PublishedVersionNumber == null)
        {
            return null;
        }

        return await _unitOfWork.UiBuilderVersionRepo
            .GetByConditionAsync(w => w.UiBuilderProjectId == project.Id && w.VersionNumber == project.PublishedVersionNumber)
            .SingleOrDefaultAsync();
    }

    private static UiBuilderProjectViewDto BuildPublishedView(UiBuilderProject project, UiBuilderVersion headVersion)
    {
        return new UiBuilderProjectViewDto
        {
            Project = project.Adapt<UiBuilderProjectDto>(),
            HeadVersion = headVersion.Adapt<UiBuilderVersionDto>()
        };
    }

    private async Task<UiBuilderProject?> GetWritableProjectAsync(Guid id)
    {
        var project = await _unitOfWork.UiBuilderProjectRepo
            .GetByConditionAsync(w => w.Id == id)
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync();

        if (project == null || project.TenantId != _currentTenantService.CurrentTenantId)
        {
            return null;
        }

        return project;
    }

    private bool HasReadAccess(UiBuilderProject project)
    {
        return project.CreatedByUserId == _userId || project.IsTenantWideAccess;
    }

    private bool HasWriteAccess(UiBuilderProject project)
    {
        return project.CreatedByUserId == _userId || project.IsTenantWideAccess;
    }
}
