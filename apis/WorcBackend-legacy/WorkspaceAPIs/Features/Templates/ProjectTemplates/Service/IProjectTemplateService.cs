namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines operations for managing project templates.
/// </summary>
public interface IProjectTemplateService
{
    /// <summary>
    /// Retrieves a collection of project templates, optionally filtered by type.
    /// </summary>
    /// <param name="type">The type of project templates to retrieve (optional).</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a list of project templates.</returns>
    Task<ServiceResponse<IEnumerable<ProjectTemplateDto>>> GetAllProjectTemplatesAsync(ProjectTemplateTypesEnum? type);

    /// <summary>
    /// Retrieves a project template by its unique identifier.
    /// </summary>
    /// <param name="projectTemplateId">The ID of the project template to retrieve.</param>
    /// <returns>The project template with the specified ID.</returns>
    Task<ServiceResponse<ProjectTemplateDto>> GetProjectTemplateAsync(Guid projectTemplateId);

    /// <summary>
    /// Retrieves a project template by its reference ID.
    /// </summary>
    /// <param name="refId">The reference ID of the project template to retrieve.</param>
    /// <returns>The project template with the specified reference ID.</returns>
    Task<ServiceResponse<ProjectTemplateDto>> GetProjectTemplateByRefIdAsync(Guid refId);

    /// <summary>
    /// Creates a new project template.
    /// </summary>
    /// <param name="projectTemplateDto">The data for the project template to be created.</param>
    /// <returns>Returns the newly created project template.</returns>
    Task<ServiceResponse<ProjectTemplateDto>> InsertProjectTemplateAsync(ProjectTemplateDto projectTemplateDto);

    /// <summary>
    /// Updates an existing project template.
    /// </summary>
    /// <param name="projectTemplateDto">The updated data for the project template.</param>
    /// <returns>Returns the updated project template.</returns>
    Task<ServiceResponse<ProjectTemplateDto>> UpdateProjectTemplateAsync(ProjectTemplateDto projectTemplateDto);

    /// <summary>
    /// Deletes a project template by its unique identifier.
    /// </summary>
    /// <param name="projectTemplateId">The ID of the project template to delete.</param>
    /// <returns>Returns a service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteProjectTemplateAsync(Guid projectTemplateId);

    /// <summary>
    /// Deletes multiple project templates by their unique identifiers.
    /// </summary>
    /// <param name="projectTemplateIds">The IDs of the project templates to delete.</param>
    /// <returns>Returns a service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteProjectTemplatesAsync(IEnumerable<Guid> projectTemplateIds);

    /// <summary>
    /// Retrieves tenant project templates that are pending approval.
    /// </summary>
    /// <returns>A list of project templates that are pending approval.</returns>
    Task<ServiceResponse<IEnumerable<ProjectTemplateDto>>> GetTenantPendingApprovalProjectTemplatesAsync();


    /// <summary>
    /// Retrieves public project templates that are pending approval.
    /// </summary>
    /// <returns>A list of project templates that are pending approval.</returns>
    Task<ServiceResponse<IEnumerable<ProjectTemplateDto>>> GetPublicPendingApprovalProjectTemplatesAsync();

    /// <summary>
    /// Approves or rejects a project template based on the provided status.
    /// </summary>
    /// <param name="projectTemplateDto">The project template data transfer object containing the template details and status update.</param>
    /// <returns>The updated project template after the approval or rejection operation.</returns>
    Task<ServiceResponse<ProjectTemplateDto>> UpdateTemplateStatusAsync(ProjectTemplateDto projectTemplateDto);

    /// <summary>
    /// Publishes a new project template from a specific version or configuration.
    /// </summary>
    /// <param name="publishProjectTemplateDto">The data required to publish a new project template.</param>
    /// <returns>Returns the newly published project template.</returns>
    Task<ServiceResponse<ProjectTemplateDto>> PublishProjectTemplateAsync(PublishProjectTemplateDto publishProjectTemplateDto);

    /// <summary>
    /// Searches for project templates using a keyword.
    /// </summary>
    /// <param name="searchKey">The keyword to search for in project template data.</param>
    /// <param name="type">The type of project templates to retrieve (optional).</param>
    /// <returns>A list of project templates that match the search key.</returns>
    Task<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>> SearchProjectTemplatesAsync(string searchKey, ProjectTemplateTypesEnum? type);

    /// <summary>
    /// Retrieves a list of trending project templates.
    /// </summary>
    /// <returns>A list of trending project templates.</returns>
    Task<ServiceResponse<IEnumerable<TrendingTemplateDto>>> GetAllTrendingProjectTemplatesAsync();

    /// <summary>
    /// Uses the selected project template to create a new Agent flow configuration, based on the template type.
    /// </summary>
    /// <param name="trendingTemplateDto">The trending project template to base the creation on.</param>
    /// <returns>A response containing the created entity details or an error message.</returns>
    Task<ServiceResponse<ProjectTemplateDto>> UseProjectTemplateAsync(TrendingTemplateDto trendingTemplateDto);

    /// <summary>
    /// Uses a Large Language Model (LLM) to generate documentation or instructions based on the provided project template data.
    /// </summary>
    /// <param name="genereateProjectInstructionRequestDto">The request containing the project template flow data to be processed by the LLM.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> containing the generated documentation or instructions as a string.</returns>
    Task<ServiceResponse<string>> GenerateTemplateUsingLLMAsync(GenereateProjectInstructionRequestDto genereateProjectInstructionRequestDto);

    /// <summary>
    /// Validates a list of projects or resources to determine if they are approved templates and verifies access permissions based on their access types.
    /// </summary>
    /// <param name="projectAccessStatusDtos">A collection of project access status DTOs for validation.</param>
    /// <returns>A task that returns a service response containing validation results for each project.</returns>
    Task<ServiceResponse<List<ProjectAccessStatusDto>>> ValidateProjectAccessAsync(IEnumerable<ProjectAccessStatusDto> projectAccessStatusDtos);

    /// <summary>
    /// Retrieves a list of project templates for select-option dropdowns,
    /// optionally filtered by type.
    /// </summary>
    /// <param name="type">Optional type of project templates to filter.</param>
    /// <returns>A ServiceResponse containing a list of SelectOption.</returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetProjectTemplatesForSelectOptionsAsync(ProjectTemplateTypesEnum? type = null);
}
