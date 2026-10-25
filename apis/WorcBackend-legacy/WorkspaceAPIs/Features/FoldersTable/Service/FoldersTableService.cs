namespace WorkspaceAPIs.Services;

public class FoldersTableService : IFoldersTableService
{
    private readonly ILogger<FoldersTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FoldersTableService(
        ILogger<FoldersTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResponse<IEnumerable<FoldersTableRowDto>>> GetFoldersAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<FoldersTableRowDto>>.Create("Failed to fetch folders", 500);

        try
        {
            var folders = await _unitOfWork.FolderRepo
                .GetByConditionAsync(w => true)
                .Include(i => i.CreatedByUser)
                .OrderBy(o => o.Name)
                .ToListAsync();

            var flowCounts = await GetFlowCountsByFolderAsync();

            var folderDtos = folders.Adapt<List<FoldersTableRowDto>>();
            folderDtos.ForEach(folderDto => folderDto.FlowCount = flowCounts.GetValueOrDefault(folderDto.Id));

            return serviceResponse.Update(null, 200, folderDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving folders.");
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<FoldersTableRowDto>> InsertFolderAsync(InsertFolderDto insertFolderDto)
    {
        var serviceResponse = ServiceResponse<FoldersTableRowDto>.Create("Failed to add folder", 500);

        try
        {
            insertFolderDto = TrimDtoStringPropsUtil.TrimDtoStringProps(insertFolderDto);

            if (string.IsNullOrEmpty(insertFolderDto.Name))
                return serviceResponse.Update("Folder name is required", 400);

            if (await FolderNameExistsAsync(insertFolderDto.Name, null))
                return serviceResponse.Update($"A folder named '{insertFolderDto.Name}' already exists.", 409);

            var newFolder = insertFolderDto.Adapt<Folder>();
            newFolder.Description = NullIfEmpty(insertFolderDto.Description);
            newFolder.Color = NullIfEmpty(insertFolderDto.Color);
            newFolder.CreatedByUserId = _userId;
            newFolder.LastModifiedByUserId = _userId;

            await _unitOfWork.FolderRepo.InsertAsync(newFolder);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse;

            return serviceResponse.Update("Folder added", 201, await GetFolderRowAsync(newFolder.Id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding folder.");
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<FoldersTableRowDto>> UpdateFolderAsync(UpdateFolderDto updateFolderDto)
    {
        var serviceResponse = ServiceResponse<FoldersTableRowDto>.Create("Failed to update folder", 500);

        try
        {
            var folder = await _unitOfWork.FolderRepo
                .GetByConditionAsync(w => w.Id == updateFolderDto.Id)
                .FirstOrDefaultAsync();

            if (folder == null)
                return serviceResponse.Update("Folder not found", 404);

            updateFolderDto = TrimDtoStringPropsUtil.TrimDtoStringProps(updateFolderDto);

            if (string.IsNullOrEmpty(updateFolderDto.Name))
                return serviceResponse.Update("Folder name is required", 400);

            if (await FolderNameExistsAsync(updateFolderDto.Name, folder.Id))
                return serviceResponse.Update($"A folder named '{updateFolderDto.Name}' already exists.", 409);

            folder.Name = updateFolderDto.Name;
            folder.Description = NullIfEmpty(updateFolderDto.Description);
            folder.Color = NullIfEmpty(updateFolderDto.Color);
            folder.LastModifiedByUserId = _userId;
            folder.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.FolderRepo.Update(folder);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse;

            return serviceResponse.Update("Folder updated", 200, await GetFolderRowAsync(folder.Id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating folder {FolderId}.", updateFolderDto.Id);
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<bool>> DeleteFolderAsync(Guid folderId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete folder", 500);

        try
        {
            var folder = await _unitOfWork.FolderRepo
                .GetByConditionAsync(w => w.Id == folderId)
                .FirstOrDefaultAsync();

            if (folder == null)
                return serviceResponse.Update("Folder not found", 404);

            // IMPORTANT NOTE: Agents of other users and archived agents are not tracked by EF here; the Flows.FolderId foreign key (ON DELETE SET NULL) returns them to the top level.
            _unitOfWork.FolderRepo.Delete(folder);

            if (!await _unitOfWork.SaveAsync())
                return serviceResponse;

            return serviceResponse.Update("Folder deleted", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting folder {FolderId}.", folderId);
            return serviceResponse;
        }
    }

    private async Task<bool> FolderNameExistsAsync(string name, Guid? excludedFolderId)
    {
        var lowerCaseName = name.ToLower();

        return await _unitOfWork.FolderRepo
            .GetByConditionAsync(w => w.Name.ToLower() == lowerCaseName && w.Id != excludedFolderId)
            .AnyAsync();
    }

    private static string? NullIfEmpty(string? value)
    {
        return string.IsNullOrEmpty(value) ? null : value;
    }

    private async Task<Dictionary<Guid, int>> GetFlowCountsByFolderAsync()
    {
        return await _unitOfWork.FlowRepo
            .GetByConditionAsync(w => w.FolderId != null)
            .GroupBy(g => g.FolderId!.Value)
            .Select(s => new { FolderId = s.Key, Count = s.Count() })
            .ToDictionaryAsync(k => k.FolderId, v => v.Count);
    }

    private async Task<FoldersTableRowDto> GetFolderRowAsync(Guid folderId)
    {
        var folder = await _unitOfWork.FolderRepo
            .GetByConditionAsync(w => w.Id == folderId)
            .Include(i => i.CreatedByUser)
            .SingleAsync();

        var folderDto = folder.Adapt<FoldersTableRowDto>();
        folderDto.FlowCount = (await GetFlowCountsByFolderAsync()).GetValueOrDefault(folderId);

        return folderDto;
    }
}
