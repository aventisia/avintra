using WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;
using WorkspaceAPIs.Features.Chats.ChatProjects.Helpers;

namespace WorkspaceAPIs.Services;

public class ChatProjectService : IChatProjectService
{
    private readonly ILogger<ChatProjectService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ChatProjectService(
        ILogger<ChatProjectService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    public async Task<ServiceResponse<IEnumerable<ChatProjectDto>>> GetChatProjectsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<ChatProjectDto>>.Create("Failed to fetch chat projects", 500);

        try
        {
            var projects = await _unitOfWork.ChatProjectRepo
                .GetByConditionAsync(w => w.UserId == _userId)
                .OrderBy(o => o.Name)
                .AsNoTracking()
                .Select(s => new ChatProjectDto { Id = s.Id, Name = s.Name, Instructions = s.Instructions })
                .ToListAsync();

            return serviceResponse.Update(null, 200, projects);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat projects for User ID {userId}.", _userId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<ChatProjectDto>> InsertChatProjectAsync(InsertChatProjectDto insertChatProjectDto)
    {
        var serviceResponse = ServiceResponse<ChatProjectDto>.Create("Failed to create chat project", 500);

        try
        {
            var project = new ChatProject
            {
                Name = insertChatProjectDto.Name.Trim(),
                UserId = _userId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            };
            await _unitOfWork.ChatProjectRepo.InsertAsync(project);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            return serviceResponse.Update("Chat project created", 201, new ChatProjectDto { Id = project.Id, Name = project.Name });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating chat project for User ID {userId}.", _userId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<ChatProjectDto>> UpdateChatProjectAsync(UpdateChatProjectDto updateChatProjectDto)
    {
        var serviceResponse = ServiceResponse<ChatProjectDto>.Create("Failed to update chat project", 500);

        try
        {
            var name = updateChatProjectDto.Name.Trim();
            if (name.Length == 0)
                return serviceResponse.Update("Name is required", 400);

            var project = _unitOfWork.ChatProjectRepo
                .GetByConditionAsync(w => w.Id == updateChatProjectDto.Id && w.UserId == _userId);
            var keepInstructions = updateChatProjectDto.Instructions == null;
            var newInstructions = keepInstructions ? null : NormalizeInstructions(updateChatProjectDto.Instructions!);

            var updated = await project.ExecuteUpdateAsync(setters => setters
                .SetProperty(p => p.Name, name)
                .SetProperty(p => p.Instructions, p => keepInstructions ? p.Instructions : newInstructions)
                .SetProperty(p => p.LastModifiedByUserId, _userId)
                .SetProperty(p => p.LastModifiedOn, DateTimeOffset.UtcNow));

            if (updated == 0)
                return serviceResponse.Update("Chat project not found", 404);

            var instructions = keepInstructions
                ? await project.Select(p => p.Instructions).SingleAsync()
                : newInstructions;

            return serviceResponse.Update("Chat project updated", 200, new ChatProjectDto { Id = updateChatProjectDto.Id, Name = name, Instructions = instructions });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating chat project {chatProjectId} for User ID {userId}.", updateChatProjectDto.Id, _userId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<bool>> DeleteChatProjectAsync(Guid chatProjectId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete chat project", 500);

        try
        {
            var project = await _unitOfWork.ChatProjectRepo
                .GetByConditionAsync(w => w.Id == chatProjectId && w.UserId == _userId)
                .SingleOrDefaultAsync();

            if (project == null)
                return serviceResponse.Update("Chat project not found", 404);

            _unitOfWork.ChatProjectRepo.Delete(project);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            return serviceResponse.Update(null, 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting chat project {chatProjectId} for User ID {userId}.", chatProjectId, _userId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<IEnumerable<ChatProjectFileDto>>> GetChatProjectFilesAsync(Guid chatProjectId)
    {
        var serviceResponse = ServiceResponse<IEnumerable<ChatProjectFileDto>>.Create("Failed to fetch project files", 500);

        try
        {
            if (!await OwnsProjectAsync(chatProjectId))
                return serviceResponse.Update("Chat project not found", 404);

            var files = await _unitOfWork.ChatProjectFileRepo
                .GetByConditionAsync(w => w.ProjectId == chatProjectId && w.UserId == _userId)
                .OrderBy(o => o.CreatedOn)
                .AsNoTracking()
                .Select(s => new ChatProjectFileDto { Id = s.Id, Name = s.Name, SizeBytes = s.SizeBytes })
                .ToListAsync();

            return serviceResponse.Update(null, 200, files);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving files of chat project {chatProjectId} for User ID {userId}.", chatProjectId, _userId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<ChatProjectFileDto>> InsertChatProjectFileAsync(Guid chatProjectId, InsertChatProjectFileDto insertChatProjectFileDto)
    {
        var serviceResponse = ServiceResponse<ChatProjectFileDto>.Create("Failed to add project file", 500);

        try
        {
            if (!await OwnsProjectAsync(chatProjectId))
                return serviceResponse.Update("Chat project not found", 404);

            var name = insertChatProjectFileDto.Name.Trim();
            var sizeBytes = ChatProjectsHelpers.FileSizeOf(insertChatProjectFileDto.Content);
            var invalid = ChatProjectsHelpers.ValidateFile(name, insertChatProjectFileDto.Content, sizeBytes);
            if (invalid != null)
                return serviceResponse.Update(invalid, 400);

            // IMPORTANT NOTE: the count and total checks are not atomic with the insert, so parallel uploads can
            // overshoot them; the overshoot only enlarges this user's own prompt, so no lock is taken.
            var existingSizes = await _unitOfWork.ChatProjectFileRepo
                .GetByConditionAsync(w => w.ProjectId == chatProjectId && w.UserId == _userId)
                .AsNoTracking()
                .Select(s => s.SizeBytes)
                .ToListAsync();

            if (existingSizes.Count >= ChatProjectsHelpers.MaxFiles)
                return serviceResponse.Update($"A project can hold up to {ChatProjectsHelpers.MaxFiles} files. Remove one to add another.", 400);

            if (existingSizes.Sum() + sizeBytes > ChatProjectsHelpers.MaxTotalBytes)
                return serviceResponse.Update($"Project files can total up to {ChatProjectsHelpers.MaxTotalBytes / 1024} KB. Remove a file to add this one.", 400);

            var file = new ChatProjectFile
            {
                ProjectId = chatProjectId,
                UserId = _userId,
                Name = name,
                Content = insertChatProjectFileDto.Content,
                SizeBytes = sizeBytes,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
            };
            await _unitOfWork.ChatProjectFileRepo.InsertAsync(file);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            return serviceResponse.Update("Project file added", 201, new ChatProjectFileDto { Id = file.Id, Name = file.Name, SizeBytes = file.SizeBytes });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding a file to chat project {chatProjectId} for User ID {userId}.", chatProjectId, _userId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<bool>> DeleteChatProjectFileAsync(Guid chatProjectId, Guid fileId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete project file", 500);

        try
        {
            var file = await _unitOfWork.ChatProjectFileRepo
                .GetByConditionAsync(w => w.Id == fileId && w.ProjectId == chatProjectId && w.UserId == _userId)
                .SingleOrDefaultAsync();

            if (file == null)
                return serviceResponse.Update("Project file not found", 404);

            _unitOfWork.ChatProjectFileRepo.Delete(file);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            return serviceResponse.Update(null, 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {fileId} of chat project {chatProjectId} for User ID {userId}.", fileId, chatProjectId, _userId);
            return serviceResponse;
        }
    }

    private Task<bool> OwnsProjectAsync(Guid chatProjectId) =>
        _unitOfWork.ChatProjectRepo.GetByConditionAsync(w => w.Id == chatProjectId && w.UserId == _userId).AnyAsync();

    private static string? NormalizeInstructions(string instructions)
    {
        var trimmed = instructions.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }
}
