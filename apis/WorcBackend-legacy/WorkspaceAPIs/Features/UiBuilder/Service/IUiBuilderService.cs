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

    /// <summary>
    /// Pins the current head version of a custom UI builder project as its published version.
    /// </summary>
    /// <param name="id">The ID of the project to publish.</param>
    /// <returns>The task result contains the service response with the published project details.</returns>
    Task<ServiceResponse<UiBuilderProjectDto>> PublishUiBuilderProjectAsync(Guid id);

    /// <summary>
    /// Retrieves all published custom UI builder projects.
    /// </summary>
    /// <returns>The task result contains the service response with the list of published project details.</returns>
    Task<ServiceResponse<IEnumerable<UiBuilderProjectDto>>> GetPublishedUiBuilderProjectsAsync();

    /// <summary>
    /// Retrieves all published custom UI builder projects assigned to the current user.
    /// </summary>
    /// <returns>The task result contains the service response with the list of assigned project details.</returns>
    Task<ServiceResponse<IEnumerable<UiBuilderProjectDto>>> GetMyUiBuilderProjectsAsync();

    /// <summary>
    /// Retrieves a published custom UI builder project and its pinned published version for an assigned user.
    /// </summary>
    /// <param name="id">The ID of the project to retrieve.</param>
    /// <returns>The task result contains the service response with the published project and pinned version.</returns>
    Task<ServiceResponse<UiBuilderProjectViewDto>> GetPublishedUiBuilderViewAsync(Guid id);

    /// <summary>
    /// Retrieves a published custom UI builder project and its pinned published version for the orchestrator preview.
    /// </summary>
    /// <param name="id">The ID of the project to retrieve.</param>
    /// <returns>The task result contains the service response with the published project and pinned version.</returns>
    Task<ServiceResponse<UiBuilderProjectViewDto>> GetOmUiBuilderViewAsync(Guid id);

    /// <summary>
    /// Retrieves the text-capable models enabled for the current tenant.
    /// </summary>
    /// <returns>The task result contains the service response with the list of models, without secrets.</returns>
    Task<ServiceResponse<IEnumerable<UiBuilderModelDto>>> GetUiBuilderModelsAsync();

    /// <summary>
    /// Replaces the data connections bound to a custom UI builder project.
    /// </summary>
    /// <param name="id">The ID of the project to update.</param>
    /// <param name="dataConnectionDtos">The complete list of data connections.</param>
    /// <returns>The task result contains the service response with the updated project details.</returns>
    Task<ServiceResponse<UiBuilderProjectDto>> UpdateUiBuilderDataConnectionsAsync(Guid id, List<UiBuilderDataConnectionDto> dataConnectionDtos);

    /// <summary>
    /// Retrieves list of work items from the queue bound to a project data connection.
    /// </summary>
    /// <param name="id">The ID of the project.</param>
    /// <param name="key">The key of the data connection.</param>
    /// <param name="uiBuilderDataListRequestDto">The status, paging, and payload conditions.</param>
    /// <returns>The task result contains the service response with the list of work items.</returns>
    Task<ServiceResponse<IEnumerable<QueueWorkItemDto>>> GetUiBuilderDataItemsAsync(Guid id, string key, UiBuilderDataListRequestDto uiBuilderDataListRequestDto);

    /// <summary>
    /// Runs a declarative query (filters, grouping, and metrics) over the queue bound to a project data connection.
    /// </summary>
    /// <param name="id">The project ID.</param>
    /// <param name="key">The data connection key.</param>
    /// <param name="uiBuilderDataQueryRequestDto">The shared filters and named queries.</param>
    /// <returns>The rows of each named query.</returns>
    Task<ServiceResponse<UiBuilderDataQueryResultDto>> QueryUiBuilderDataAsync(Guid id, string key, UiBuilderDataQueryRequestDto uiBuilderDataQueryRequestDto);

    /// <summary>
    /// Retrieves a work item by its ID from the queue bound to a project data connection.
    /// </summary>
    /// <param name="id">The ID of the project.</param>
    /// <param name="key">The key of the data connection.</param>
    /// <param name="itemId">The ID of the work item.</param>
    /// <returns>The task result contains the service response with the work item details.</returns>
    Task<ServiceResponse<QueueWorkItemDto>> GetUiBuilderDataItemAsync(Guid id, string key, Guid itemId);

    /// <summary>
    /// Insert a new work item into the queue bound to a project data connection.
    /// </summary>
    /// <param name="id">The ID of the project.</param>
    /// <param name="key">The key of the data connection.</param>
    /// <param name="uiBuilderDataItemInsertDto">The work item payload and description.</param>
    /// <returns>The task result contains the service response with the inserted work item details.</returns>
    Task<ServiceResponse<QueueWorkItemDto>> InsertUiBuilderDataItemAsync(Guid id, string key, UiBuilderDataItemInsertDto uiBuilderDataItemInsertDto);

    /// <summary>
    /// Updates an existing work item of the queue bound to a project data connection.
    /// </summary>
    /// <param name="id">The ID of the project.</param>
    /// <param name="key">The key of the data connection.</param>
    /// <param name="uiBuilderDataItemUpdateDto">The work item ID with the new status and/or payload.</param>
    /// <returns>The task result contains the service response with the updated work item details.</returns>
    Task<ServiceResponse<QueueWorkItemDto>> UpdateUiBuilderDataItemAsync(Guid id, string key, UiBuilderDataItemUpdateDto uiBuilderDataItemUpdateDto);
}
