using WorkspaceAPIs.Features.Chats.UserChatProfile.DTOs;

namespace WorkspaceAPIs.Services;

public class UserChatProfileService : IUserChatProfileService
{
    private readonly ILogger<UserChatProfileService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public UserChatProfileService(
        ILogger<UserChatProfileService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    public async Task<ServiceResponse<UserChatProfileDto>> GetUserChatProfileAsync()
    {
        var serviceResponse = ServiceResponse<UserChatProfileDto>.Create("Failed to fetch chat profile", 500);

        try
        {
            var profile = await _unitOfWork.UserChatProfileRepo
                .GetByConditionAsync(w => w.UserId == _userId)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            return serviceResponse.Update(null, 200, ToDto(profile));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving chat profile for User ID {userId}.", _userId);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<UserChatProfileDto>> UpdateUserChatProfileAsync(UpdateUserChatProfileDto updateUserChatProfileDto)
    {
        var serviceResponse = ServiceResponse<UserChatProfileDto>.Create("Failed to save chat profile", 500);

        try
        {
            var profile = await _unitOfWork.UserChatProfileRepo
                .GetByConditionAsync(w => w.UserId == _userId)
                .SingleOrDefaultAsync();

            if (profile == null)
            {
                profile = new Entities.UserChatProfile
                {
                    UserId = _userId,
                    CreatedByUserId = _userId,
                };
                await _unitOfWork.UserChatProfileRepo.InsertAsync(profile);
            }
            else
            {
                _unitOfWork.UserChatProfileRepo.Update(profile);
            }

            profile.LastModifiedByUserId = _userId;
            profile.CustomInstructions = updateUserChatProfileDto.CustomInstructions.Trim();
            profile.MemoryNotes = updateUserChatProfileDto.MemoryNotes.Trim();

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("An error occurred while saving changes.", 500);

            return serviceResponse.Update("Chat profile saved", 200, ToDto(profile));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving chat profile for User ID {userId}.", _userId);
            return serviceResponse;
        }
    }

    private static UserChatProfileDto ToDto(Entities.UserChatProfile? profile) => new()
    {
        CustomInstructions = profile?.CustomInstructions ?? string.Empty,
        MemoryNotes = profile?.MemoryNotes ?? string.Empty,
    };
}
