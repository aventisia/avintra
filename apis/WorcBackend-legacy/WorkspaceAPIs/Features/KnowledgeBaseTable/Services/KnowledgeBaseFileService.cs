namespace WorkspaceAPIs.Services;

/// <summary>
/// Handles CRUD operations for Knowledge Base file metadata.
/// </summary>
public class KnowledgeBaseFileService : IKnowledgeBaseFileService
{
    private readonly ILogger<KnowledgeBaseFileService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly ICurrentTenantService _currentTenantService;

    public KnowledgeBaseFileService(
        ILogger<KnowledgeBaseFileService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
    }

    /// <summary>
    /// Retrieves all files registered under a specific knowledge base.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<KnowledgeBaseFileDto>>> GetKnowledgeBaseFilesAsync(Guid knowledgeBaseId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<KnowledgeBaseFileDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            var kb = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(k => k.Id == knowledgeBaseId)
                .FirstOrDefaultAsync();

            if (kb == null)
            {
                serviceResponse.Message = "Knowledge base not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            var files = await _unitOfWork.KnowledgeBaseFileRepo
                .GetByConditionAsync(f => f.KnowledgeBaseId == knowledgeBaseId)
                .Include(f => f.CreatedByUser)
                .OrderByDescending(f => f.CreatedOn)
                .ToListAsync();

            serviceResponse.Data = files.Adapt<List<KnowledgeBaseFileDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Knowledge base files retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving files for knowledge base {KnowledgeBaseId} and user {UserId}", knowledgeBaseId, _userId);
            serviceResponse.Message = "Failed to retrieve knowledge base files. Please try again";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Registers an uploaded file under a specific knowledge base.
    /// </summary>
    public async Task<ServiceResponse<KnowledgeBaseFileDto>> RegisterKnowledgeBaseFileAsync(Guid knowledgeBaseId, KBRegisterFileDto dto)
    {
        var serviceResponse = new ServiceResponse<KnowledgeBaseFileDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            dto = TrimDtoStringPropsUtil.TrimDtoStringProps(dto);

            if (string.IsNullOrWhiteSpace(dto.FileName) || string.IsNullOrWhiteSpace(dto.FileUrl))
            {
                serviceResponse.Message = "File name and file URL are required";
                return serviceResponse;
            }

            var kb = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(k => k.Id == knowledgeBaseId)
                .FirstOrDefaultAsync();

            if (kb == null)
            {
                serviceResponse.Message = "Knowledge base not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            var extension = dto.FileExtension;
            if (string.IsNullOrWhiteSpace(extension))
                extension = Path.GetExtension(dto.FileName);

            var kbFile = new KnowledgeBaseFile
            {
                Id = Guid.NewGuid(),
                TenantId = _currentTenantService.CurrentTenantId,
                KnowledgeBaseId = knowledgeBaseId,
                FileName = dto.FileName,
                Extension = extension,
                ContentType = GetContentTypeFromExtension(extension),
                SizeInBytes = dto.FileSizeInBytes,
                Status = VectorizationStatusEnum.Pending,
                VectorizationErrorMessage = null,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow,
                LastModifiedOn = DateTimeOffset.UtcNow,
                IsDisabled = false
            };

            await _unitOfWork.KnowledgeBaseFileRepo.InsertAsync(kbFile);
            await _unitOfWork.SaveAsync();

            var createdFile = await _unitOfWork.KnowledgeBaseFileRepo
                .GetByConditionAsync(f => f.Id == kbFile.Id)
                .Include(f => f.CreatedByUser)
                .FirstOrDefaultAsync();

            serviceResponse.Data = (createdFile ?? kbFile).Adapt<KnowledgeBaseFileDto>();
            serviceResponse.StatusCode = 201;
            serviceResponse.Message = "Knowledge base file registered successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering file for knowledge base {KnowledgeBaseId} and user {UserId}", knowledgeBaseId, _userId);
            serviceResponse.Message = "Failed to register knowledge base file. Please try again";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Registers raw text as a file-like source under a specific knowledge base.
    /// </summary>
    public async Task<ServiceResponse<KnowledgeBaseFileDto>> RegisterKnowledgeBaseTextAsync(Guid knowledgeBaseId, KBRegisterTextDto dto)
    {
        var serviceResponse = new ServiceResponse<KnowledgeBaseFileDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            dto = TrimDtoStringPropsUtil.TrimDtoStringProps(dto);

            if (string.IsNullOrWhiteSpace(dto.TextContent) || string.IsNullOrWhiteSpace(dto.FileName))
            {
                serviceResponse.Message = "Text content and file name are required";
                return serviceResponse;
            }

            var kb = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(k => k.Id == knowledgeBaseId && k.TenantId == _currentTenantService.CurrentTenantId)
                .FirstOrDefaultAsync();

            if (kb == null)
            {
                serviceResponse.Message = "Knowledge base not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            var textBytes = Encoding.UTF8.GetByteCount(dto.TextContent);
            var kbFile = new KnowledgeBaseFile
            {
                Id = Guid.NewGuid(),
                TenantId = _currentTenantService.CurrentTenantId,
                KnowledgeBaseId = knowledgeBaseId,
                FileName = dto.FileName,
                Extension = ".txt",
                ContentType = "text/plain",
                SizeInBytes = textBytes,
                Status = VectorizationStatusEnum.Pending,
                VectorizationErrorMessage = null,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow,
                LastModifiedOn = DateTimeOffset.UtcNow,
                IsDisabled = false
            };

            await _unitOfWork.KnowledgeBaseFileRepo.InsertAsync(kbFile);
            await _unitOfWork.SaveAsync();

            var createdFile = await _unitOfWork.KnowledgeBaseFileRepo
                .GetByConditionAsync(f => f.Id == kbFile.Id)
                .Include(f => f.CreatedByUser)
                .FirstOrDefaultAsync();

            serviceResponse.Data = (createdFile ?? kbFile).Adapt<KnowledgeBaseFileDto>();
            serviceResponse.StatusCode = 201;
            serviceResponse.Message = "Knowledge base text registered successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering text for knowledge base {KnowledgeBaseId} and user {UserId}", knowledgeBaseId, _userId);
            serviceResponse.Message = "Failed to register text content. Please try again";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Deletes a registered file metadata record from a knowledge base.
    /// </summary>
    public async Task<ServiceResponse<bool>> DeleteKnowledgeBaseFileAsync(Guid knowledgeBaseId, Guid fileId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            var kb = await _unitOfWork.KnowledgeBaseRepo
                .GetByConditionAsync(k => k.Id == knowledgeBaseId && k.TenantId == _currentTenantService.CurrentTenantId)
                .FirstOrDefaultAsync();

            if (kb == null)
            {
                serviceResponse.Message = "Knowledge base not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            var kbFile = await _unitOfWork.KnowledgeBaseFileRepo
                .GetByConditionAsync(f => f.Id == fileId && f.KnowledgeBaseId == knowledgeBaseId)
                .FirstOrDefaultAsync();

            if (kbFile == null)
            {
                serviceResponse.Message = "Knowledge base file not found";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            _unitOfWork.KnowledgeBaseFileRepo.Delete(kbFile);
            await _unitOfWork.SaveAsync();

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Knowledge base file deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting knowledge base file {FileId} for knowledge base {KnowledgeBaseId} and user {UserId}", fileId, knowledgeBaseId, _userId);
            serviceResponse.Message = "Failed to delete knowledge base file. Please try again";
        }

        return serviceResponse;
    }

    private static string? GetContentTypeFromExtension(string? extension)
    {
        return extension?.ToLowerInvariant() switch
        {
            ".pdf" => "application/pdf",
            ".txt" => "text/plain",
            ".md" => "text/markdown",
            ".json" => "application/json",
            ".csv" => "text/csv",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => null,
        };
    }
}
