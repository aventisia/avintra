namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing skill registry files.
/// </summary>
public interface ISkillRegistryFileService
{
    /// <summary>
    /// Retrieves all files registered under a specific skill.
    /// </summary>
    /// <param name="skillId">The ID of the skill.</param>
    /// <returns>The task result contains the service response with the list of skill files.</returns>
    Task<ServiceResponse<IEnumerable<SkillFileDto>>> GetSkillFilesAsync(Guid skillId);

    /// <summary>
    /// Registers a file under a specific skill.
    /// </summary>
    /// <param name="skillId">The ID of the skill.</param>
    /// <param name="registerSkillFileDto">The file registration payload.</param>
    /// <returns>The task result contains the service response with the registered skill file.</returns>
    Task<ServiceResponse<SkillFileDto>> RegisterSkillFileAsync(Guid skillId, RegisterSkillFileDto registerSkillFileDto);

    /// <summary>
    /// Deletes a file from a skill.
    /// </summary>
    /// <param name="skillId">The ID of the skill.</param>
    /// <param name="fileId">The ID of the file to delete.</param>
    /// <returns>The task result contains the service response indicating whether the file was deleted.</returns>
    Task<ServiceResponse<bool>> DeleteSkillFileAsync(Guid skillId, Guid fileId);

    /// <summary>
    /// Downloads all files for a skill as a zip archive.
    /// </summary>
    /// <param name="skillId">The ID of the skill.</param>
    /// <returns>The task result contains the service response with the zip file bytes.</returns>
    Task<ServiceResponse<byte[]>> DownloadSkillAsZipAsync(Guid skillId);
}
