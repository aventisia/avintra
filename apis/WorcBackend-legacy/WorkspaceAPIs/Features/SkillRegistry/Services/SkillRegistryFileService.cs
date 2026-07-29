namespace WorkspaceAPIs.Services;

/// <summary>
/// Handles CRUD operations for skill registry files.
/// </summary>
public class SkillRegistryFileService : ISkillRegistryFileService
{
    private readonly ILogger<SkillRegistryFileService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IResourceShareService _resourceShareService;

    public SkillRegistryFileService(
        ILogger<SkillRegistryFileService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IResourceShareService resourceShareService)
    {
        // Extract current user ID from JWT claim; fallback to empty Guid when missing.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _resourceShareService = resourceShareService;
    }

    /// <summary>
    /// Retrieves all files registered under a specific skill.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<SkillFileDto>>> GetSkillFilesAsync(Guid skillId)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<IEnumerable<SkillFileDto>>.Create("Failed to retrieve skill files. Please try again", 400);

        try
        {
            // Validate the provided skill ID.
            if (skillId == Guid.Empty)
            {
                serviceResponse.Message = "A valid skill ID is required to retrieve files";
                return serviceResponse;
            }

            // Retrieve the skill and verify access.
            var skill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(s => s.Id == skillId)
                .FirstOrDefaultAsync();

            // Return 404 when skill does not exist.
            if (skill == null)
            {
                serviceResponse.Message = "Skill not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Verify the current user has view access to the skill.
            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                skill.Id,
                ResourceTypeEnum.Skill,
                skill.CreatedByUserId,
                skill.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // Return forbidden when user lacks view permission.
            if (!canView)
            {
                serviceResponse.Message = "You do not have permission to view this skill";
                return serviceResponse;
            }

            // Load files belonging to the skill, including creator information.
            var files = await _unitOfWork.SkillFileRepo
                .GetByConditionAsync(f => f.SkillId == skillId)
                .Include(f => f.CreatedByUser)
                .OrderBy(f => f.FileName)
                .ToListAsync();

            serviceResponse.Update("Skill files retrieved successfully", 200, files.Adapt<List<SkillFileDto>>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving files for skill {SkillId} and user {UserId}", skillId, _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Registers a file under a specific skill.
    /// </summary>
    public async Task<ServiceResponse<SkillFileDto>> RegisterSkillFileAsync(Guid skillId, RegisterSkillFileDto registerSkillFileDto)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<SkillFileDto>.Create("Failed to register skill file. Please try again", 400);

        try
        {
            // Normalize DTO string properties before validation and persistence.
            registerSkillFileDto = TrimDtoStringPropsUtil.TrimDtoStringProps(registerSkillFileDto);

            // Validate the provided skill ID.
            if (skillId == Guid.Empty)
            {
                serviceResponse.Message = "A valid skill ID is required to register a file";
                return serviceResponse;
            }

            // Validate that file name is provided.
            if (string.IsNullOrWhiteSpace(registerSkillFileDto.FileName))
            {
                serviceResponse.Message = "File name is required";
                return serviceResponse;
            }

            // Validate that file content is provided.
            if (registerSkillFileDto.Content == null)
            {
                serviceResponse.Message = "File content is required";
                return serviceResponse;
            }

            // Sanitize file name to prevent path traversal and overly long names.
            var safeFileName = Path.GetFileName(registerSkillFileDto.FileName);
            if (string.IsNullOrWhiteSpace(safeFileName) || safeFileName != registerSkillFileDto.FileName)
            {
                serviceResponse.Message = "Invalid file name; path traversal or unsafe names are not allowed";
                return serviceResponse;
            }

            // Retrieve the skill and verify edit access.
            var skill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(s => s.Id == skillId)
                .FirstOrDefaultAsync();

            // Return 404 when skill does not exist.
            if (skill == null)
            {
                serviceResponse.Message = "Skill not found";
                return serviceResponse;
            }

            // Verify the current user has edit access to the skill.
            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                skill.Id,
                ResourceTypeEnum.Skill,
                skill.CreatedByUserId,
                skill.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // Return forbidden when user lacks edit permission.
            if (!canEdit)
            {
                serviceResponse.Message = "You do not have permission to add files to this skill";
                return serviceResponse;
            }

            // Enforce unique file name within the skill.
            var duplicate = await _unitOfWork.SkillFileRepo
                .GetByConditionAsync(f => f.SkillId == skillId && f.FileName == safeFileName)
                .FirstOrDefaultAsync();

            if (duplicate != null)
            {
                serviceResponse.Message = $"A file named '{safeFileName}' already exists in this skill";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Infer file type from extension when not explicitly provided.
            var fileType = !string.IsNullOrWhiteSpace(registerSkillFileDto.FileType)
                ? registerSkillFileDto.FileType
                : InferFileType(safeFileName);

            // Build new skill file entity from the DTO.
            var skillFile = new SkillFile
            {
                Id = Guid.NewGuid(),
                TenantId = _currentTenantService.CurrentTenantId,
                SkillId = skillId,
                FileName = safeFileName,
                Content = Encoding.UTF8.GetBytes(registerSkillFileDto.Content),
                FileType = fileType,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow,
                LastModifiedOn = DateTimeOffset.UtcNow,
                IsDisabled = false
            };

            // Persist new skill file.
            await _unitOfWork.SkillFileRepo.InsertAsync(skillFile);
            await _unitOfWork.SaveAsync();

            // Reload file with creator information for the response.
            var createdFile = await _unitOfWork.SkillFileRepo
                .GetByConditionAsync(f => f.Id == skillFile.Id)
                .Include(f => f.CreatedByUser)
                .FirstOrDefaultAsync();

            serviceResponse.Update("Skill file registered successfully", 201, (createdFile ?? skillFile).Adapt<SkillFileDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering file for skill {SkillId} and user {UserId}", skillId, _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Deletes a file from a skill.
    /// </summary>
    public async Task<ServiceResponse<bool>> DeleteSkillFileAsync(Guid skillId, Guid fileId)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete skill file. Please try again", 400, false);

        try
        {
            // Validate the provided skill and file IDs.
            if (skillId == Guid.Empty || fileId == Guid.Empty)
            {
                serviceResponse.Message = "Valid skill ID and file ID are required";
                return serviceResponse;
            }

            // Retrieve the skill and verify edit access.
            var skill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(s => s.Id == skillId)
                .FirstOrDefaultAsync();

            // Return 404 when skill does not exist.
            if (skill == null)
            {
                serviceResponse.Message = "Skill not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Verify the current user has edit access to the skill.
            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                skill.Id,
                ResourceTypeEnum.Skill,
                skill.CreatedByUserId,
                skill.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // Return forbidden when user lacks edit permission.
            if (!canEdit)
            {
                serviceResponse.Message = "You do not have permission to delete files from this skill";
                return serviceResponse;
            }

            // Load the specific file linked to the skill.
            var skillFile = await _unitOfWork.SkillFileRepo
                .GetByConditionAsync(f => f.Id == fileId && f.SkillId == skillId)
                .FirstOrDefaultAsync();

            // Return 404 when file does not exist under the skill.
            if (skillFile == null)
            {
                serviceResponse.Message = "Skill file not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Delete file and save changes.
            _unitOfWork.SkillFileRepo.Delete(skillFile);
            await _unitOfWork.SaveAsync();

            serviceResponse.Update("Skill file deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting skill file {FileId} for skill {SkillId} and user {UserId}", fileId, skillId, _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Downloads all files for a skill as a zip archive.
    /// </summary>
    public async Task<ServiceResponse<byte[]>> DownloadSkillAsZipAsync(Guid skillId)
    {
        // Initialize a failed response in case the operation does not complete successfully.
        var serviceResponse = ServiceResponse<byte[]>.Create("Failed to download skill files. Please try again", 400);

        try
        {
            // Validate the provided skill ID.
            if (skillId == Guid.Empty)
            {
                serviceResponse.Message = "A valid skill ID is required to download files";
                return serviceResponse;
            }

            // Retrieve the skill with its files and verify access.
            var skill = await _unitOfWork.SkillRepo
                .GetByConditionAsync(s => s.Id == skillId)
                .Include(s => s.Files)
                .FirstOrDefaultAsync();

            // Return 404 when skill does not exist.
            if (skill == null)
            {
                serviceResponse.Message = "Skill not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            // Verify the current user has view access to the skill.
            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                skill.Id,
                ResourceTypeEnum.Skill,
                skill.CreatedByUserId,
                skill.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // Return forbidden when user lacks view permission.
            if (!canView)
            {
                serviceResponse.Message = "You do not have permission to download this skill";
                return serviceResponse;
            }

            // Ensure the skill has files to download.
            if (skill.Files == null || skill.Files.Count == 0)
            {
                serviceResponse.Message = "No files available for this skill";
                return serviceResponse;
            }

            // Build zip archive in memory.
            using var memoryStream = new MemoryStream();
            using (var archive = new System.IO.Compression.ZipArchive(
                memoryStream,
                System.IO.Compression.ZipArchiveMode.Create,
                true))
            {
                // Add each skill file as a zip entry.
                foreach (var file in skill.Files)
                {
                    var entry = archive.CreateEntry(
                        file.FileName,
                        System.IO.Compression.CompressionLevel.Optimal);

                    await using var entryStream = entry.Open();
                    await entryStream.WriteAsync(file.Content);
                }
            }
            serviceResponse.Update("Skill files downloaded successfully", 200, memoryStream.ToArray());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading skill files for skill {SkillId} and user {UserId}", skillId, _userId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Infers a friendly file type from the file extension.
    /// </summary>
    private static string? InferFileType(string fileName)
    {
        return Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".md" => "markdown",
            ".py" => "python",
            ".sh" => "shell",
            ".js" => "javascript",
            ".ts" => "typescript",
            ".json" => "json",
            ".yaml" or ".yml" => "yaml",
            ".txt" => "text",
            ".csv" => "csv",
            ".ps1" => "powershell",
            _ => null,
        };
    }
}
