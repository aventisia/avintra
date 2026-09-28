namespace WorkspaceAPIs.Controllers;

/// <summary>
/// Controller for managing skill registry file operations.
/// </summary>
[Route("skill-registry")]
[ApiController]
[Authorize]
public class SkillRegistryFileController : BaseApiController
{
    private readonly ISkillRegistryFileService _skillRegistryFileService;

    public SkillRegistryFileController(ISkillRegistryFileService skillRegistryFileService)
    {
        _skillRegistryFileService = skillRegistryFileService;
    }

    // Retrieves all files for a specific skill.
    [HttpGet("{skillId}/files")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SkillFileDto>>>> GetSkillFiles(Guid skillId)
    {
        return ResultHelper(await _skillRegistryFileService.GetSkillFilesAsync(skillId));
    }

    // Registers a file under a specific skill.
    // Edit access is verified per-record in the service (owner or edit-level share).
    [HttpPost("{skillId}/files")]
    public async Task<ActionResult<ServiceResponse<SkillFileDto>>> RegisterSkillFile(Guid skillId, [FromBody] RegisterSkillFileDto registerSkillFileDto)
    {
        return ResultHelper(await _skillRegistryFileService.RegisterSkillFileAsync(skillId, registerSkillFileDto));
    }

    // Deletes a specific file from a skill.
    [HttpDelete("{skillId}/files/{fileId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSkillFile(Guid skillId, Guid fileId)
    {
        return ResultHelper(await _skillRegistryFileService.DeleteSkillFileAsync(skillId, fileId));
    }

    // Downloads all files for a skill as a zip archive.
    [HttpGet("{skillId}/files/download")]
    public async Task<IActionResult> DownloadSkillAsZip(Guid skillId)
    {
        var result = await _skillRegistryFileService.DownloadSkillAsZipAsync(skillId);
        if (result.StatusCode != 200 || result.Data == null)
            return BadRequest(result);

        return File(result.Data, "application/zip", $"skill-{skillId}.zip");
    }
}
