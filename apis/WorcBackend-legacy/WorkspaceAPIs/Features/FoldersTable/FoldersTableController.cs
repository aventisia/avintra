namespace WorkspaceAPIs.Controllers;

[Route("folder"), ApiController, Authorize]
public class FoldersTableController : BaseApiController
{
    private readonly IFoldersTableService _foldersTableService;

    public FoldersTableController(IFoldersTableService foldersTableService)
    {
        _foldersTableService = foldersTableService;
    }

    /// <summary>
    /// Retrieves list of folders.
    /// </summary>
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FoldersTableRowDto>>>> GetFolders()
    {
        return ResultHelper(await _foldersTableService.GetFoldersAsync());
    }

    /// <summary>
    /// Inserts a new folder.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FoldersTableRowDto>>> InsertFolder([FromBody] InsertFolderDto insertFolderDto)
    {
        return ResultHelper(await _foldersTableService.InsertFolderAsync(insertFolderDto));
    }

    /// <summary>
    /// Updates an existing folder.
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<FoldersTableRowDto>>> UpdateFolder([FromBody] UpdateFolderDto updateFolderDto)
    {
        return ResultHelper(await _foldersTableService.UpdateFolderAsync(updateFolderDto));
    }

    /// <summary>
    /// Deletes an existing folder.
    /// </summary>
    [HttpDelete("{folderId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFolder(Guid folderId)
    {
        return ResultHelper(await _foldersTableService.DeleteFolderAsync(folderId));
    }
}
