namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing custom UI builder projects and their generated versions.
/// </summary>
public interface IUiBuilderService
{
    /// <summary>
    /// Retrieves all custom UI builder projects created by the user, or the ones shared tenant-wide.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal projects. If <c>false</c>, returns only shared projects. </param>
    /// <returns>The task result contains the service response with the list of project details.</returns>
    Task<ServiceResponse<IEnumerable<UiBuilderProjectDto>>> GetUiBuilderProjectsAsync(bool isPersonal);

    /// <summary>
    /// Retrieves a custom UI builder project by its ID.
    /// </summary>
    /// <param name="id">The ID of the project to retrieve.</param>
    /// <returns>The task result contains the service response with the project details.</returns>
    Task<ServiceResponse<UiBuilderProjectDto>> GetUiBuilderProjectAsync(Guid id);

    /// <summary>
    /// Retrieves all generated versions of a custom UI builder project.
    /// </summary>
    /// <param name="id">The ID of the project whose versions are retrieved.</param>
    /// <returns>The task result contains the service response with the list of version details.</returns>
    Task<ServiceResponse<IEnumerable<UiBuilderVersionDto>>> GetUiBuilderVersionsAsync(Guid id);

    /// <summary>
    /// Inserts a new custom UI builder project.
    /// </summary>
    /// <param name="uiBuilderProjectDto">The data required to insert the project.</param>
    /// <returns>The task result contains the service response with the inserted project details.</returns>
    Task<ServiceResponse<UiBuilderProjectDto>> InsertUiBuilderProjectAsync(UiBuilderProjectDto uiBuilderProjectDto);

    /// <summary>
    /// Updates an existing custom UI builder project.
    /// </summary>
    /// <param name="uiBuilderProjectDto">The data required to update the project.</param>
    /// <returns>The task result contains the service response with the updated project details.</returns>
    Task<ServiceResponse<UiBuilderProjectDto>> UpdateUiBuilderProjectAsync(UiBuilderProjectDto uiBuilderProjectDto);

    /// <summary>
    /// Deletes a custom UI builder project by its ID.
    /// </summary>
    /// <param name="id">The ID of the project to delete.</param>
    /// <returns>The task result contains the service response indicating whether the project was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteUiBuilderProjectAsync(Guid id);

    /// <summary>
    /// Deletes multiple custom UI builder projects by their IDs.
    /// </summary>
    /// <param name="ids">The IDs of the projects to delete.</param>
    /// <returns>The task result contains the service response with the number of deleted projects.</returns>
    Task<ServiceResponse<int>> DeleteUiBuilderProjectsAsync(List<Guid> ids);

    /// <summary>
    /// Checks the availability of a custom UI builder project name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the project name to check.</param>
    /// <returns>The task result contains the service response indicating whether the project name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsUiBuilderNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Inserts a new generated version for a custom UI builder project.
    /// </summary>
    /// <param name="id">The ID of the project the version belongs to.</param>
    /// <param name="uiBuilderVersionDto">The data required to insert the version.</param>
    /// <returns>The task result contains the service response with the inserted version details.</returns>
    Task<ServiceResponse<UiBuilderVersionDto>> InsertUiBuilderVersionAsync(Guid id, UiBuilderVersionDto uiBuilderVersionDto);

    /// <summary>
    /// Restores a project version as a new head version.
    /// </summary>
    /// <param name="id">The ID of the project the version belongs to.</param>
    /// <param name="versionNumber">The version number to restore.</param>
    /// <returns>The task result contains the service response with the newly created version details.</returns>
    Task<ServiceResponse<UiBuilderVersionDto>> RestoreUiBuilderVersionAsync(Guid id, int versionNumber);
}
