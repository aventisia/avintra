using WorkspaceAPIs.Features.TenantModelProvider.Helpers;

namespace WorkspaceAPIs.Services;

public class UiBuilderService : IUiBuilderService
{
    private readonly ILogger<UiBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IQueueWorkItemService _queueWorkItemService;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly Guid _userId;

    public UiBuilderService(
        ILogger<UiBuilderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IQueueWorkItemService queueWorkItemService,
        IStringEncryptionService stringEncryptionService)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _queueWorkItemService = queueWorkItemService;
        _stringEncryptionService = stringEncryptionService;
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

    public async Task<ServiceResponse<IEnumerable<UiBuilderModelDto>>> GetUiBuilderModelsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderModelDto>>.Create("Failed to retrieve models. Please try again", 400);

        try
        {
            var tenantId = _currentTenantService.CurrentTenantId;

            var providers = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.TenantId == tenantId && !w.IsDisabled)
                .AsNoTracking()
                .ToListAsync();

            var credentialsById = await GetProviderCredentialsAsync(providers);

            var models = providers
                .SelectMany(provider => GetTextModelIds(provider)
                    .Select(modelId => BuildUiBuilderModel(provider, modelId, credentialsById)))
                .GroupBy(model => new { model.ProviderType, model.ModelId })
                .Select(group => group.First())
                .OrderBy(model => model.ProviderType)
                .ThenBy(model => model.ModelId)
                .ToList();

            serviceResponse.Update("Models retrieved successfully", 200, models);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectDto>> UpdateUiBuilderDataConnectionsAsync(Guid id, List<UiBuilderDataConnectionDto> dataConnectionDtos)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectDto>.Create("Failed to update data connections. Please try again", 400);

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
                _logger.LogWarning("Unauthorized data connection update. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to update this project.", 403);
                return serviceResponse;
            }

            dataConnectionDtos ??= new List<UiBuilderDataConnectionDto>();

            var validationError = UiBuilderDataConnectionHelpers.NormalizeDataConnections(dataConnectionDtos)
                ?? await ApplyBoundQueuesAsync(dataConnectionDtos);

            if (validationError != null)
            {
                serviceResponse.Update(validationError, 400);
                return serviceResponse;
            }

            project.DataConnections = dataConnectionDtos.Adapt<List<UiBuilderDataConnection>>();
            project.LastModifiedByUserId = _userId;
            project.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.UiBuilderProjectRepo.Update(project);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            var projectDto = project.Adapt<UiBuilderProjectDto>();
            projectDto.AccessLevel = ResourceAccessTypeEnum.Owner;

            serviceResponse.Update("Data connections updated successfully", 200, projectDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<QueueWorkItemDto>>> GetUiBuilderDataItemsAsync(Guid id, string key, UiBuilderDataListRequestDto uiBuilderDataListRequestDto)
    {
        var serviceResponse = ServiceResponse<IEnumerable<QueueWorkItemDto>>.Create("Failed to retrieve data. Please try again", 400);

        try
        {
            var (dataConnection, message, statusCode) = await ResolveDataConnectionAsync(id, key, UiBuilderDataConnectionHelpers.ListOperation);
            if (dataConnection == null)
            {
                serviceResponse.Update(message, statusCode);
                return serviceResponse;
            }

            var queueFilterRequestDto = new QueueFilterRequestDto
            {
                QueueId = dataConnection.QueueId,
                Status = string.IsNullOrWhiteSpace(uiBuilderDataListRequestDto.Status) ? null : uiBuilderDataListRequestDto.Status.Trim(),
                Conditions = uiBuilderDataListRequestDto.Conditions ?? new List<QueueFilterCondition>(),
                Top = UiBuilderDataConnectionHelpers.ClampListTop(uiBuilderDataListRequestDto.Top),
                Skip = Math.Max(uiBuilderDataListRequestDto.Skip ?? 0, 0)
            };

            return await _queueWorkItemService.GetQueueWorkItemsAsync(queueFilterRequestDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<UiBuilderDataQueryResultDto>> QueryUiBuilderDataAsync(Guid id, string key, UiBuilderDataQueryRequestDto uiBuilderDataQueryRequestDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderDataQueryResultDto>.Create("Failed to query data. Please try again", 400);

        try
        {
            var (dataConnection, message, statusCode) = await ResolveDataConnectionAsync(id, key, UiBuilderDataConnectionHelpers.ListOperation);
            if (dataConnection == null)
            {
                serviceResponse.Update(message, statusCode);
                return serviceResponse;
            }

            var tenantId = _currentTenantService.CurrentTenantId;
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.TenantId == tenantId && w.Id == dataConnection.QueueId)
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Select(s => new { s.InputSchema, s.IsStoredEncrypted })
                .SingleOrDefaultAsync();

            if (queue == null)
            {
                serviceResponse.Update($"Queue for data connection '{dataConnection.Key}' is no longer available", 404);
                return serviceResponse;
            }

            var schema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                string.IsNullOrWhiteSpace(queue.InputSchema) ? "[]" : queue.InputSchema,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<QueueSchemaDefinitionDto>();

            var workItems = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.TenantId == tenantId && w.QueueId == dataConnection.QueueId && !w.IsDisabled)
                .IgnoreQueryFilters()
                .AsNoTracking()
                .OrderByDescending(o => o.CreatedOn)
                .Take(UiBuilderDataQueryHelpers.MaxScannedItems + 1)
                .Select(s => new { s.Id, s.Status, s.PayloadData, s.CreatedOn, s.LastModifiedOn, s.Assignee })
                .ToListAsync();

            var isTruncated = workItems.Count > UiBuilderDataQueryHelpers.MaxScannedItems;
            var queryItems = workItems
                .Take(UiBuilderDataQueryHelpers.MaxScannedItems)
                .Select(s => new UiBuilderDataQueryItem(
                    s.Id,
                    s.Status,
                    ParseWorkItemPayload(s.PayloadData, queue.IsStoredEncrypted),
                    s.CreatedOn,
                    s.LastModifiedOn,
                    s.Assignee))
                .ToList();

            var result = UiBuilderDataQueryHelpers.Run(schema, queryItems, uiBuilderDataQueryRequestDto, isTruncated);
            serviceResponse.Update("Data queried", 200, result);
            return serviceResponse;
        }
        catch (ArgumentException ex)
        {
            serviceResponse.Update(ex.Message, 400);
            return serviceResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<QueueWorkItemDto>> GetUiBuilderDataItemAsync(Guid id, string key, Guid itemId)
    {
        var serviceResponse = ServiceResponse<QueueWorkItemDto>.Create("Failed to retrieve data item. Please try again", 400);

        try
        {
            var (dataConnection, message, statusCode) = await ResolveDataConnectionAsync(id, key, UiBuilderDataConnectionHelpers.GetOperation);
            if (dataConnection == null)
            {
                serviceResponse.Update(message, statusCode);
                return serviceResponse;
            }

            var workItemResponse = await _queueWorkItemService.GetQueueWorkItemByIdAsync(itemId);
            if (workItemResponse.Data != null && workItemResponse.Data.QueueId != dataConnection.QueueId)
            {
                serviceResponse.Update("Data item does not exist", 404);
                return serviceResponse;
            }

            return workItemResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<QueueWorkItemDto>> InsertUiBuilderDataItemAsync(Guid id, string key, UiBuilderDataItemInsertDto uiBuilderDataItemInsertDto)
    {
        var serviceResponse = ServiceResponse<QueueWorkItemDto>.Create("Failed to add data item. Please try again", 400);

        try
        {
            var (dataConnection, message, statusCode) = await ResolveDataConnectionAsync(id, key, UiBuilderDataConnectionHelpers.AddOperation);
            if (dataConnection == null)
            {
                serviceResponse.Update(message, statusCode);
                return serviceResponse;
            }

            if (uiBuilderDataItemInsertDto.WorkItemData.ValueKind != JsonValueKind.Object)
            {
                serviceResponse.Update("Work item data must be a JSON object", 400);
                return serviceResponse;
            }

            var queueWorkItemDto = new QueueWorkItemDto
            {
                QueueId = dataConnection.QueueId,
                WorkItemData = uiBuilderDataItemInsertDto.WorkItemData.GetRawText(),
                Description = uiBuilderDataItemInsertDto.Description
            };

            return await _queueWorkItemService.InsertWorkItemsAsync(queueWorkItemDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<QueueWorkItemDto>> UpdateUiBuilderDataItemAsync(Guid id, string key, UiBuilderDataItemUpdateDto uiBuilderDataItemUpdateDto)
    {
        var serviceResponse = ServiceResponse<QueueWorkItemDto>.Create("Failed to update data item. Please try again", 400);

        try
        {
            var (dataConnection, message, statusCode) = await ResolveDataConnectionAsync(id, key, UiBuilderDataConnectionHelpers.UpdateOperation);
            if (dataConnection == null)
            {
                serviceResponse.Update(message, statusCode);
                return serviceResponse;
            }

            var workItemData = uiBuilderDataItemUpdateDto.WorkItemData;
            if (workItemData.HasValue && workItemData.Value.ValueKind is not (JsonValueKind.Object or JsonValueKind.Null or JsonValueKind.Undefined))
            {
                serviceResponse.Update("Work item data must be a JSON object", 400);
                return serviceResponse;
            }

            var existingWorkItem = (await _queueWorkItemService.GetQueueWorkItemByIdAsync(uiBuilderDataItemUpdateDto.Id)).Data;
            if (existingWorkItem == null || existingWorkItem.QueueId != dataConnection.QueueId)
            {
                serviceResponse.Update("Data item does not exist", 404);
                return serviceResponse;
            }

            var queueWorkItemDto = new QueueWorkItemDto
            {
                Id = existingWorkItem.Id,
                QueueId = dataConnection.QueueId,
                Status = uiBuilderDataItemUpdateDto.Status,
                WorkItemData = workItemData?.ValueKind == JsonValueKind.Object ? workItemData.Value.GetRawText() : null,
                Description = existingWorkItem.Description,
                IsUserModified = true
            };

            return await _queueWorkItemService.UpdateWorkItemAsync(queueWorkItemDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
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

    private async Task<Dictionary<Guid, VaultCredential>> GetProviderCredentialsAsync(List<TenantModelProvider> providers)
    {
        var credentialIds = providers
            .Where(provider => provider.CredentialId.HasValue)
            .Select(provider => provider.CredentialId!.Value)
            .Distinct()
            .ToList();

        if (credentialIds.Count == 0)
        {
            return new Dictionary<Guid, VaultCredential>();
        }

        var tenantId = _currentTenantService.CurrentTenantId;

        return await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => w.TenantId == tenantId && credentialIds.Contains(w.Id))
            .IgnoreQueryFilters()
            .AsNoTracking()
            .ToDictionaryAsync(credential => credential.Id);
    }

    private static IEnumerable<string> GetTextModelIds(TenantModelProvider provider)
    {
        return (provider.EnabledModels ?? new List<EnabledModel>())
            .Where(model => !string.IsNullOrWhiteSpace(model.ModelId) &&
                EnabledModelHelpers.IsCapabilityMatch(EnabledModelHelpers.ParseCapability(model.Capability), ModelCapabilityEnum.Text))
            .Select(model => model.ModelId.Trim());
    }

    private static UiBuilderModelDto BuildUiBuilderModel(TenantModelProvider provider, string modelId, Dictionary<Guid, VaultCredential> credentialsById)
    {
        var credential = provider.CredentialId.HasValue && credentialsById.TryGetValue(provider.CredentialId.Value, out var resolvedCredential)
            ? resolvedCredential
            : null;

        return new UiBuilderModelDto
        {
            ProviderType = provider.ProviderType.ToString(),
            ModelId = modelId,
            CredentialName = credential?.Name,
            CredentialEnvType = credential != null ? UiBuilderDataConnectionHelpers.ToEnvTypeName(credential.EnvType) : null,
            ProviderUrl = string.IsNullOrWhiteSpace(provider.ProviderUrl) ? null : provider.ProviderUrl
        };
    }

    private async Task<string?> ApplyBoundQueuesAsync(List<UiBuilderDataConnectionDto> dataConnectionDtos)
    {
        if (dataConnectionDtos.Count == 0)
        {
            return null;
        }

        var tenantId = _currentTenantService.CurrentTenantId;
        var queueIds = dataConnectionDtos.Select(dataConnection => dataConnection.QueueId).Distinct().ToList();

        var queuesById = await _unitOfWork.QueueRepo
            .GetByConditionAsync(w => w.TenantId == tenantId && queueIds.Contains(w.Id) && !w.IsDisabled)
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Select(w => new { w.Id, w.Name, w.EnvType })
            .ToDictionaryAsync(queue => queue.Id);

        foreach (var dataConnection in dataConnectionDtos)
        {
            if (!queuesById.TryGetValue(dataConnection.QueueId, out var queue))
            {
                return $"Queue for data connection '{dataConnection.Key}' does not exist or is disabled";
            }

            var queueEnvType = UiBuilderDataConnectionHelpers.ToEnvTypeName(queue.EnvType);
            if (queueEnvType != dataConnection.EnvType)
            {
                return $"Queue '{queue.Name}' belongs to the {queueEnvType} environment, not {dataConnection.EnvType}";
            }

            dataConnection.QueueName = queue.Name;
        }

        return null;
    }

    private async Task<(UiBuilderDataConnection? DataConnection, string Message, int StatusCode)> ResolveDataConnectionAsync(Guid id, string key, string operation)
    {
        var project = await GetDataAccessibleProjectAsync(id);
        if (project == null)
        {
            return (null, "Project does not exist", 404);
        }

        var dataConnection = project.DataConnections
            .FirstOrDefault(connection => string.Equals(connection.Key, key, StringComparison.OrdinalIgnoreCase));

        if (dataConnection == null)
        {
            return (null, $"Data connection '{key}' does not exist", 404);
        }

        if (!dataConnection.Operations.Contains(operation))
        {
            return (null, $"Data connection '{dataConnection.Key}' does not allow the '{operation}' operation", 403);
        }

        var currentEnvType = UiBuilderDataConnectionHelpers.ToEnvTypeName(_currentTenantService.CurrentEnvType);
        if (dataConnection.EnvType != currentEnvType)
        {
            return (null, $"Data connection '{dataConnection.Key}' targets the {dataConnection.EnvType} environment. Send X-Env-Type: {dataConnection.EnvType}", 400);
        }

        var tenantId = _currentTenantService.CurrentTenantId;
        var envType = _currentTenantService.CurrentEnvType;

        // IMPORTANT NOTE: The queue work item services release their semaphore even when the queue lookup fails, so the bound queue must be confirmed before delegating.
        var isQueueAvailable = await _unitOfWork.QueueRepo
            .GetByConditionAsync(w => w.TenantId == tenantId && w.Id == dataConnection.QueueId && w.EnvType == envType && !w.IsDisabled)
            .IgnoreQueryFilters()
            .AnyAsync();

        if (!isQueueAvailable)
        {
            return (null, $"Queue for data connection '{dataConnection.Key}' is no longer available", 404);
        }

        return (dataConnection, string.Empty, 200);
    }

    private JObject ParseWorkItemPayload(string? payloadData, bool isStoredEncrypted)
    {
        if (string.IsNullOrWhiteSpace(payloadData))
        {
            return new JObject();
        }

        try
        {
            var payload = isStoredEncrypted ? _stringEncryptionService.DecryptString(payloadData) : payloadData;
            return JToken.Parse(payload) as JObject ?? new JObject();
        }
        catch (Exception)
        {
            return new JObject();
        }
    }

    private async Task<UiBuilderProject?> GetDataAccessibleProjectAsync(Guid id)
    {
        var project = await _unitOfWork.UiBuilderProjectRepo
            .GetByConditionAsync(w => w.Id == id)
            .AsNoTracking()
            .SingleOrDefaultAsync();

        if (project == null)
        {
            return null;
        }

        return HasReadAccess(project) ? project : await GetVisiblePublishedProjectAsync(id, true);
    }
}
