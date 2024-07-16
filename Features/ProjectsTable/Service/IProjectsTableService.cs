namespace WorkspaceAPIs.Services;

public interface IProjectsTableService
{
    /// <summary>
    /// Retrieves list of projects.
    /// </summary>
    /// <returns>The task result contains the service response with the list of projects.</returns>
    Task<ServiceResponse<IEnumerable<ProjectsTableDto>>> GetProjectsAsync();

    /// <summary>
    /// Inserts a new project.
    /// </summary>
    /// <param name="projectsTableDto">The data for the project to insert.</param>
    /// <returns>The task result contains the service response with the inserted project data.</returns>
    Task<ServiceResponse<ProjectsTableDto>> InsertProjectAsync(ProjectsTableDto projectsTableDto);

    /// <summary>
    /// Updates an existing project.
    /// </summary>
    /// <param name="projectsTableDto">The data for the project to update.</param>
    /// <returns>The task result contains the service response with the updated project data.</returns>
    Task<ServiceResponse<ProjectsTableDto>> UpdateProjectAsync(ProjectsTableDto projectsTableDto);

    /// <summary>
    /// Deletes a project by its ID.
    /// </summary>
    /// <param name="id">The ID of the project to delete.</param>
    /// <returns>The task result contains the service response indicating whether the project was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteProjectAsync(Guid id);
}