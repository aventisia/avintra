namespace WorkspaceAPIs.Services;

public partial class UiBuilderService
{
    public async Task<ServiceResponse<UiBuilderProjectDto>> UpdateUiBuilderProjectSettingsAsync(Guid id, UiBuilderProjectSettingsDto uiBuilderProjectSettingsDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectDto>.Create("Failed to update project settings. Please try again", 400);

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
                _logger.LogWarning("Unauthorized settings update. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to update this project.", 403);
                return serviceResponse;
            }

            var themeError = UiBuilderProjectSettingsHelpers.NormalizeTheme(uiBuilderProjectSettingsDto.Theme);
            if (themeError != null)
            {
                serviceResponse.Update(themeError, 400);
                return serviceResponse;
            }

            var instructions = uiBuilderProjectSettingsDto.Instructions?.Trim();
            project.Instructions = string.IsNullOrEmpty(instructions) ? null : instructions;
            project.Theme = uiBuilderProjectSettingsDto.Theme?.Adapt<UiBuilderTheme>();
            project.IsTemplate = uiBuilderProjectSettingsDto.IsTemplate;
            project.LastModifiedByUserId = _userId;
            project.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.UiBuilderProjectRepo.Update(project);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            var projectDto = project.Adapt<UiBuilderProjectDto>();
            projectDto.AccessLevel = ResourceAccessTypeEnum.Owner;

            serviceResponse.Update("Project settings updated successfully", 200, projectDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderProjectDto>>> GetUiBuilderTemplatesAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderProjectDto>>.Create("Failed to retrieve templates. Please try again", 400);

        try
        {
            var templates = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.IsTemplate && !w.IsDisabled && w.UiBuilderVersions != null && w.UiBuilderVersions.Any())
                .Include(i => i.CreatedByUser)
                .AsNoTracking()
                .OrderBy(w => w.Name)
                .ToListAsync();

            var createdByUserIds = templates.ToDictionary(template => template.Id, template => template.CreatedByUserId);
            var templateDtoList = await ToProjectDtosAsync(templates);

            foreach (var templateDto in templateDtoList)
            {
                templateDto.AccessLevel = createdByUserIds[templateDto.Id] == _userId
                    ? ResourceAccessTypeEnum.Owner
                    : ResourceAccessTypeEnum.View;
                templateDto.DataConnections = new List<UiBuilderDataConnectionDto>();
            }

            serviceResponse.Update("Templates retrieved successfully", 200, templateDtoList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderProjectDto>> CloneUiBuilderProjectAsync(Guid id, UiBuilderProjectDto uiBuilderProjectDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderProjectDto>.Create("Failed to create the project from the template. Please try again", 400);

        try
        {
            var source = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w => w.Id == id)
                .Include(i => i.UiBuilderAssets)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            if (source == null || source.IsDisabled || !(source.IsTemplate || HasReadAccess(source)))
            {
                serviceResponse.Update("Template does not exist", 404);
                return serviceResponse;
            }

            var headVersion = await _unitOfWork.UiBuilderVersionRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == source.Id)
                .AsNoTracking()
                .OrderByDescending(w => w.VersionNumber)
                .FirstOrDefaultAsync();

            if (headVersion == null)
            {
                serviceResponse.Update("The template has no versions yet", 400);
                return serviceResponse;
            }

            uiBuilderProjectDto = uiBuilderProjectDto.TrimDtoStringProps();

            var nameAlreadyExists = await _unitOfWork.UiBuilderProjectRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == uiBuilderProjectDto.Name.ToLower())
                .IgnoreQueryFilters()
                .AnyAsync();

            if (nameAlreadyExists)
            {
                serviceResponse.Update("A project with same name already exists. Please enter a unique name", 409);
                return serviceResponse;
            }

            var newProject = uiBuilderProjectDto.Adapt<UiBuilderProject>();
            newProject.Id = Guid.NewGuid();
            newProject.Instructions = source.Instructions;
            newProject.Theme = source.Theme;
            newProject.CreatedByUserId = _userId;
            newProject.LastModifiedByUserId = _userId;

            await _unitOfWork.UiBuilderProjectRepo.InsertAsync(newProject);

            await _unitOfWork.UiBuilderVersionRepo.InsertAsync(new UiBuilderVersion
            {
                UiBuilderProjectId = newProject.Id,
                VersionNumber = 1,
                PromptText = $"Created from template \"{source.Name}\" (v{headVersion.VersionNumber})",
                GeneratedHtml = headVersion.GeneratedHtml,
                ContentFormat = headVersion.ContentFormat,
                SourceArtifact = headVersion.SourceArtifact,
                Provider = headVersion.Provider,
                Model = headVersion.Model,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            });

            foreach (var asset in source.UiBuilderAssets ?? new List<UiBuilderAsset>())
            {
                await _unitOfWork.UiBuilderAssetRepo.InsertAsync(new UiBuilderAsset
                {
                    UiBuilderProjectId = newProject.Id,
                    Name = asset.Name,
                    ContentType = asset.ContentType,
                    Data = asset.Data,
                    SizeBytes = asset.SizeBytes,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                });
            }

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            var projectDto = newProject.Adapt<UiBuilderProjectDto>();
            projectDto.AccessLevel = ResourceAccessTypeEnum.Owner;
            projectDto.VersionCount = 1;
            projectDto.HeadVersionNumber = 1;

            serviceResponse.Update("Project created from the template successfully", 200, projectDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderAssetDto>>> GetUiBuilderAssetsAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderAssetDto>>.Create("Failed to retrieve assets. Please try again", 400);

        try
        {
            var project = await GetWritableProjectAsync(id);
            if (project == null || !HasReadAccess(project))
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            var assets = await _unitOfWork.UiBuilderAssetRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == id)
                .AsNoTracking()
                .OrderBy(w => w.Name)
                .Select(w => new UiBuilderAssetDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    ContentType = w.ContentType,
                    SizeBytes = w.SizeBytes,
                    CreatedOn = w.CreatedOn
                })
                .ToListAsync();

            serviceResponse.Update("Assets retrieved successfully", 200, assets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderAssetDto>> InsertUiBuilderAssetAsync(Guid id, UiBuilderAssetDto uiBuilderAssetDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderAssetDto>.Create("Failed to upload the asset. Please try again", 400);

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
                _logger.LogWarning("Unauthorized asset upload. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to update this project.", 403);
                return serviceResponse;
            }

            uiBuilderAssetDto.Name = uiBuilderAssetDto.Name?.Trim() ?? string.Empty;
            uiBuilderAssetDto.ContentType = uiBuilderAssetDto.ContentType?.Trim().ToLowerInvariant() ?? string.Empty;

            var (data, error) = UiBuilderProjectSettingsHelpers.ValidateAsset(uiBuilderAssetDto);
            if (data == null)
            {
                serviceResponse.Update(error ?? "Invalid asset", 400);
                return serviceResponse;
            }

            var existingNames = await _unitOfWork.UiBuilderAssetRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == id)
                .Select(w => w.Name)
                .ToListAsync();

            if (existingNames.Any(name => string.Equals(name, uiBuilderAssetDto.Name, StringComparison.OrdinalIgnoreCase)))
            {
                serviceResponse.Update("An asset with the same name already exists in this project.", 409);
                return serviceResponse;
            }

            if (existingNames.Count >= UiBuilderProjectSettingsHelpers.MaxAssetsPerProject)
            {
                serviceResponse.Update($"A project can hold at most {UiBuilderProjectSettingsHelpers.MaxAssetsPerProject} assets.", 400);
                return serviceResponse;
            }

            var asset = new UiBuilderAsset
            {
                UiBuilderProjectId = id,
                Name = uiBuilderAssetDto.Name,
                ContentType = uiBuilderAssetDto.ContentType,
                Data = data,
                SizeBytes = data.Length,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            };

            await _unitOfWork.UiBuilderAssetRepo.InsertAsync(asset);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update("Asset uploaded successfully", 200, asset.Adapt<UiBuilderAssetDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> DeleteUiBuilderAssetAsync(Guid id, Guid assetId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete the asset. Please try again", 400);

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
                _logger.LogWarning("Unauthorized asset delete. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to update this project.", 403);
                return serviceResponse;
            }

            var asset = await _unitOfWork.UiBuilderAssetRepo
                .GetByConditionAsync(w => w.Id == assetId && w.UiBuilderProjectId == id)
                .SingleOrDefaultAsync();

            if (asset == null)
            {
                serviceResponse.Update("Asset does not exist", 404);
                return serviceResponse;
            }

            _unitOfWork.UiBuilderAssetRepo.Delete(asset);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update("Asset deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<UiBuilderAssetDto>>> GetUiBuilderAssetContentsAsync(Guid id)
    {
        var serviceResponse = ServiceResponse<IEnumerable<UiBuilderAssetDto>>.Create("Failed to retrieve assets. Please try again", 400);

        try
        {
            var project = await GetDataAccessibleProjectAsync(id);
            if (project == null)
            {
                serviceResponse.Update("Project does not exist", 404);
                return serviceResponse;
            }

            var assets = await _unitOfWork.UiBuilderAssetRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == id)
                .AsNoTracking()
                .OrderBy(w => w.Name)
                .ToListAsync();

            var assetDtoList = assets.Select(asset =>
            {
                var assetDto = asset.Adapt<UiBuilderAssetDto>();
                assetDto.DataBase64 = Convert.ToBase64String(asset.Data);
                return assetDto;
            }).ToList();

            serviceResponse.Update("Assets retrieved successfully", 200, assetDtoList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<UiBuilderVersionDto>> UpdateUiBuilderVersionLabelAsync(Guid id, int versionNumber, UiBuilderVersionLabelDto uiBuilderVersionLabelDto)
    {
        var serviceResponse = ServiceResponse<UiBuilderVersionDto>.Create("Failed to name the version. Please try again", 400);

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
                _logger.LogWarning("Unauthorized version label update. User {UserId}, Project {ProjectId}", _userId, project.Id);
                serviceResponse.Update("You do not have access to update this project.", 403);
                return serviceResponse;
            }

            var version = await _unitOfWork.UiBuilderVersionRepo
                .GetByConditionAsync(w => w.UiBuilderProjectId == id && w.VersionNumber == versionNumber)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (version == null || version.TenantId != _currentTenantService.CurrentTenantId)
            {
                serviceResponse.Update("Version does not exist", 404);
                return serviceResponse;
            }

            var label = uiBuilderVersionLabelDto.Label?.Trim();
            version.Label = string.IsNullOrEmpty(label) ? null : label;
            version.LastModifiedByUserId = _userId;
            version.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.UiBuilderVersionRepo.Update(version);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Update("Version named successfully", 200, version.Adapt<UiBuilderVersionDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}
