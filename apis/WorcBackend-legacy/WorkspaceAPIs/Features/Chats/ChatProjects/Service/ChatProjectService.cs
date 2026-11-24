using WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;

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
                .Select(s => new ChatProjectDto { Id = s.Id, Name = s.Name })
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
        var serviceResponse = ServiceResponse<ChatProjectDto>.Create("Failed to rename chat project", 500);

        try
        {
            var name = updateChatProjectDto.Name.Trim();
            if (name.Length == 0)
                return serviceResponse.Update("Name is required", 400);

            var updated = await _unitOfWork.ChatProjectRepo
                .GetByConditionAsync(w => w.Id == updateChatProjectDto.Id && w.UserId == _userId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(p => p.Name, name)
                    .SetProperty(p => p.LastModifiedByUserId, _userId)
                    .SetProperty(p => p.LastModifiedOn, DateTimeOffset.UtcNow));

            if (updated == 0)
                return serviceResponse.Update("Chat project not found", 404);

            return serviceResponse.Update("Chat project renamed", 200, new ChatProjectDto { Id = updateChatProjectDto.Id, Name = name });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error renaming chat project {chatProjectId} for User ID {userId}.", updateChatProjectDto.Id, _userId);
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
}
