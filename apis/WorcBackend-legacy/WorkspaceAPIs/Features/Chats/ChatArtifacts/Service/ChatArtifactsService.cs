namespace WorkspaceAPIs.Services;

public class ChatArtifactsService : IChatArtifactsService
{
    private readonly ILogger<ChatArtifactsService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ChatArtifactsService(
        ILogger<ChatArtifactsService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
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

            return serviceResponse.Update($"{artifacts.Count} chat artifacts deleted", 200, artifacts.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting chat artifacts with IDs {chatArtifactIds}", string.Join(", ", chatArtifactIds ?? Enumerable.Empty<Guid>()));
            return serviceResponse;
        }
    }
}
