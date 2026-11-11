namespace WorkspaceAPIs.Services;

public class ChatArtifactsService : IChatArtifactsService
{
    private readonly ILogger<ChatArtifactsService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IServiceProvider _serviceProvider;
    private readonly Guid _userId;

    public ChatArtifactsService(
        ILogger<ChatArtifactsService> logger,
        IUnitOfWork unitOfWork,
        EnvironmentConfig environmentConfig,
        ICurrentTenantService currentTenantService,
        IServiceProvider serviceProvider,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _environmentConfig = environmentConfig;
        _currentTenantService = currentTenantService;
        _serviceProvider = serviceProvider;
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    public async Task<ServiceResponse<IEnumerable<ChatArtifactDto>>> GetChatArtifactsAsync(Guid conversationId)
    {
        var serviceResponse = ServiceResponse<IEnumerable<ChatArtifactDto>>.Create("Failed to fetch chat artifacts", 500);

        try
        {
            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => w.Id == conversationId && w.UserId == _userId)
                .SingleOrDefaultAsync();

            if (conversation == null)
                return serviceResponse.Update("Conversation not found", 404);

            var artifacts = await _unitOfWork.ChatArtifactRepo
                .GetByConditionAsync(w => w.ConversationId == conversationId)
                .OrderByDescending(o => o.CreatedOn)
                .AsNoTracking()
                .ProjectToType<ChatArtifactDto>()
                .ToListAsync();

            return serviceResponse.Update(null, 200, artifacts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat artifacts for Conversation ID {conversationId}.", conversationId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<IEnumerable<ChatArtifactDto>>> GetAllChatArtifactsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<ChatArtifactDto>>.Create("Failed to fetch chat artifacts", 500);

        try
        {
            var artifacts = await _unitOfWork.ChatArtifactRepo
                .GetByConditionAsync(w => w.Conversation.UserId == _userId)
                .OrderByDescending(o => o.CreatedOn)
                .AsNoTracking()
                .ProjectToType<ChatArtifactDto>()
                .ToListAsync();

            return serviceResponse.Update(null, 200, artifacts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all chat artifacts.");
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<ChatArtifactDto>> GetChatArtifactAsync(Guid chatArtifactId)
    {
        var serviceResponse = ServiceResponse<ChatArtifactDto>.Create("Failed to fetch chat artifact", 500);

        try
        {
            var artifact = await _unitOfWork.ChatArtifactRepo
                .GetByConditionAsync(w => w.Id == chatArtifactId)
                .AsNoTracking()
                .ProjectToType<ChatArtifactDto>()
                .SingleOrDefaultAsync();

            if (artifact == null)
                return serviceResponse.Update("Chat artifact not found", 404);

            var ownsConversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => w.Id == artifact.ConversationId && w.UserId == _userId)
                .AnyAsync();

            if (!ownsConversation)
                return serviceResponse.Update("Chat artifact not found", 404);

            if (artifact.BlobPath.StartsWith(ChatArtifactsHelpers.BlobPrefix, StringComparison.Ordinal))
                artifact.BlobPath = await ReadBlobAsDataUrlAsync(artifact.BlobPath, artifact.ContentType);

            return serviceResponse.Update(null, 200, artifact);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat artifact {chatArtifactId}.", chatArtifactId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<ChatArtifactDto>> InsertChatArtifactAsync(InsertChatArtifactDto insertChatArtifactDto)
    {
        var serviceResponse = ServiceResponse<ChatArtifactDto>.Create("Failed to insert chat artifact", 500);

        try
        {
            insertChatArtifactDto = TrimDtoStringPropsUtil.TrimDtoStringProps(insertChatArtifactDto);

            if (insertChatArtifactDto.SizeBytes <= 0 || insertChatArtifactDto.SizeBytes > ChatArtifactsHelpers.MaxFileBytes)
                return serviceResponse.Update("Each file must be larger than 0 bytes and 10 MB or smaller.", 400);

            if (string.IsNullOrWhiteSpace(insertChatArtifactDto.BlobPath))
                return serviceResponse.Update("Blob path is required.", 400);

            if (insertChatArtifactDto.BlobPath.StartsWith("data:", StringComparison.OrdinalIgnoreCase) &&
                ChatArtifactsHelpers.TryGetDataUrlSizeBytes(insertChatArtifactDto.BlobPath, out var blobBytes) &&
                blobBytes > ChatArtifactsHelpers.MaxFileBytes)
                return serviceResponse.Update("Each file must be 10 MB or smaller.", 400);

            var isGeneratedArtifact = string.Equals(insertChatArtifactDto.Origin, "Generated", StringComparison.Ordinal);
            var extensionAllowed = isGeneratedArtifact
                ? ChatArtifactsHelpers.IsAllowedGeneratedExtension(Path.GetExtension(insertChatArtifactDto.Name))
                : ChatArtifactsHelpers.IsAllowedExtension(Path.GetExtension(insertChatArtifactDto.Name));
            var mimeAllowed = isGeneratedArtifact
                ? ChatArtifactsHelpers.IsAllowedGeneratedMimeType(insertChatArtifactDto.ContentType)
                : ChatArtifactsHelpers.IsAllowedMimeType(insertChatArtifactDto.ContentType);

            if (!extensionAllowed || !mimeAllowed)
                return serviceResponse.Update($"File type '{insertChatArtifactDto.ContentType}' is not supported.", 400);

            if (!string.Equals(insertChatArtifactDto.Origin, "Generated", StringComparison.Ordinal) &&
                !string.Equals(insertChatArtifactDto.Origin, "Uploaded", StringComparison.Ordinal))
                return serviceResponse.Update("Origin must be Generated or Uploaded.", 400);

            var conversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => w.Id == insertChatArtifactDto.ConversationId && w.UserId == _userId)
                .SingleOrDefaultAsync();

            if (conversation == null)
                return serviceResponse.Update("Conversation not found", 404);

            var artifact = insertChatArtifactDto.Adapt<ChatArtifact>();
            artifact.CreatedByUserId = _userId;
            artifact.LastModifiedByUserId = _userId;

            await _unitOfWork.ChatArtifactRepo.InsertAsync(artifact);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            return serviceResponse.Update("Chat artifact added", 201, artifact.Adapt<ChatArtifactDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while inserting chat artifact for Conversation ID {conversationId}", insertChatArtifactDto?.ConversationId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<bool>> DeleteChatArtifactAsync(Guid chatArtifactId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete chat artifact", 500);

        try
        {
            var artifact = await _unitOfWork.ChatArtifactRepo
                .GetByConditionAsync(w => w.Id == chatArtifactId)
                .SingleOrDefaultAsync();

            if (artifact == null)
                return serviceResponse.Update("Chat artifact not found", 404);

            var ownsConversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => w.Id == artifact.ConversationId && w.UserId == _userId)
                .AnyAsync();

            if (!ownsConversation)
                return serviceResponse.Update("Chat artifact not found", 404);

            _unitOfWork.ChatArtifactRepo.Delete(artifact);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            await DeleteBlobsAsync([artifact]);
            return serviceResponse.Update("Chat artifact deleted", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting chat artifact {chatArtifactId}", chatArtifactId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<int>> DeleteMultipleChatArtifactsAsync(IEnumerable<Guid> chatArtifactIds)
    {
        var serviceResponse = ServiceResponse<int>.Create("Failed to delete chat artifacts", 500);

        try
        {
            if (chatArtifactIds == null || !chatArtifactIds.Any())
                return serviceResponse.Update("No chat artifact ids provided.", 400);

            var distinctIds = chatArtifactIds.Distinct().ToList();

            var artifacts = await _unitOfWork.ChatArtifactRepo
                .GetByConditionAsync(w => distinctIds.Contains(w.Id))
                .ToListAsync();

            if (artifacts.Count == 0)
                return serviceResponse.Update("Chat artifacts not found", 404);

            if (artifacts.Count != distinctIds.Count)
                return serviceResponse.Update("Some chat artifacts not found", 404);

            var conversationIds = artifacts.Select(a => a.ConversationId).Distinct().ToList();
            var ownedCount = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => conversationIds.Contains(w.Id) && w.UserId == _userId)
                .CountAsync();

            if (ownedCount != conversationIds.Count)
                return serviceResponse.Update("Chat artifacts not found", 404);

            _unitOfWork.ChatArtifactRepo.Delete(artifacts);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            await DeleteBlobsAsync(artifacts);

            return serviceResponse.Update($"{artifacts.Count} chat artifacts deleted", 200, artifacts.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting chat artifacts with IDs {chatArtifactIds}", string.Join(", ", chatArtifactIds ?? Enumerable.Empty<Guid>()));
            return serviceResponse;
        }
    }

    public async Task SaveGeneratedFileAsync(Guid conversationId, string replyText, CancellationToken cancellationToken)
    {
        var file = ChatArtifactsHelpers.FindGeneratedFile(replyText);
        if (file is null)
            return;

        try
        {
            var bytes = Encoding.UTF8.GetBytes(file.Body);
            if (bytes.Length == 0 || bytes.Length > ChatArtifactsHelpers.MaxFileBytes)
            {
                _logger.LogWarning("Generated file {Name} in Conversation ID {conversationId} is empty or over the size limit; not stored.", file.Name, conversationId);
                return;
            }

            var ownsConversation = await _unitOfWork.ConversationRepo
                .GetByConditionAsync(w => w.Id == conversationId && w.UserId == _userId)
                .AnyAsync(cancellationToken);
            if (!ownsConversation)
                return;

            var isStored = await _unitOfWork.ChatArtifactRepo
                .GetByConditionAsync(w => w.ConversationId == conversationId && w.ContentType == file.ContentType && w.SizeBytes == bytes.Length)
                .AnyAsync(cancellationToken);
            if (isStored)
                return;

            var artifact = new ChatArtifact
            {
                ConversationId = conversationId,
                Name = file.Name,
                ContentType = file.ContentType,
                SizeBytes = bytes.Length,
                BlobPath = await StoreFileAsync(conversationId, file, bytes),
                Origin = "Generated",
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            };

            await _unitOfWork.ChatArtifactRepo.InsertAsync(artifact);
            if (!await _unitOfWork.SaveAsync())
                _logger.LogError("Generated file {Name} for Conversation ID {conversationId} could not be saved.", file.Name, conversationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while storing generated file {Name} for Conversation ID {conversationId}", file.Name, conversationId);
        }
    }

    private bool IsBlobStorageConfigured => !string.IsNullOrWhiteSpace(_environmentConfig.AzureBlobStorageConnectionString);

    // IMPORTANT NOTE: AzureBlobStorageService's constructor throws without a connection string, so it is resolved only once one is configured.
    private IAzureBlobStorageService BlobStorage => _serviceProvider.GetRequiredService<IAzureBlobStorageService>();

    private async Task<string> StoreFileAsync(Guid conversationId, GeneratedChatFile file, byte[] bytes)
    {
        if (!IsBlobStorageConfigured)
            return ToDataUrl(file.ContentType, bytes);

        var blobName = $"{ChatArtifactsHelpers.BlobPrefix}{conversationId}/{Guid.NewGuid()}{Path.GetExtension(file.Name)}";
        using var stream = new MemoryStream(bytes);
        await BlobStorage.UploadFileAsync(_currentTenantService.CurrentTenantContainerName, stream, blobName, file.ContentType);
        return blobName;
    }

    private async Task<string> ReadBlobAsDataUrlAsync(string blobName, string contentType)
    {
        var download = await BlobStorage.DownloadFileAsync(_currentTenantService.CurrentTenantContainerName, blobName);
        await using var content = download.Content;
        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer);
        return ToDataUrl(contentType, buffer.ToArray());
    }

    private static string ToDataUrl(string contentType, byte[] bytes) =>
        $"data:{contentType};charset=utf-8;base64,{Convert.ToBase64String(bytes)}";

    private async Task DeleteBlobsAsync(IEnumerable<ChatArtifact> artifacts)
    {
        foreach (var artifact in artifacts.Where(a => a.BlobPath.StartsWith(ChatArtifactsHelpers.BlobPrefix, StringComparison.Ordinal)))
        {
            try
            {
                await BlobStorage.DeleteFileAsync(_currentTenantService.CurrentTenantContainerName, artifact.BlobPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Blob {BlobPath} of deleted chat artifact {chatArtifactId} could not be removed.", artifact.BlobPath, artifact.Id);
            }
        }
    }
}
