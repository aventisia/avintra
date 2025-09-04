namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines operations for managing template file resources associated with project templates.
/// </summary>
public interface ITemplateResourceService
{
    /// <summary>
    /// Retrieves all template resources linked to the specified project template (flow version).
    /// </summary>
    /// <param name="projectTemplateId">The unique identifier of the project template (flow version).</param>
    /// <returns>A service response containing a collection of associated template resources.</returns>
    Task<ServiceResponse<IEnumerable<TemplateResourceDto>>> GetTemplateResourcesByProjectTemplateIdAsync(Guid projectTemplateId);

    /// <summary>
    /// Retrieves a specific template resource by its unique identifier.
    /// </summary>
    /// <param name="templateResourceId">The unique identifier of the template resource.</param>
    /// <returns>A service response containing the requested template resource, if found.</returns>
    Task<ServiceResponse<TemplateResourceDto>> GetTemplateResourceByIdAsync(Guid templateResourceId);

    /// <summary>
    /// Inserts a new template resource associated with a flow version or project template.
    /// </summary>
    /// <param name="templateResourceDto">The data representing the template resource to be added.</param>
    /// <returns>A service response containing the newly added template resource.</returns>
    Task<ServiceResponse<TemplateResourceDto>> InsertTemplateResourceAsync(TemplateResourceDto templateResourceDto);

    /// <summary>
    /// Updates the details of an existing template resource.
    /// </summary>
    /// <param name="templateResourceDto">The updated data for the template resource.</param>
    /// <returns>A service response containing the updated template resource.</returns>
    Task<ServiceResponse<TemplateResourceDto>> UpdateTemplateResourceAsync(TemplateResourceDto templateResourceDto);

    /// <summary>
    /// Deletes a specific template resource by its unique identifier.
    /// </summary>
    /// <param name="templateResourceId">The unique identifier of the template resource to be deleted.</param>
    /// <returns>A service response indicating the success or failure of the delete operation.</returns>
    Task<ServiceResponse<bool>> DeleteTemplateResourceAsync(Guid templateResourceId);

    /// <summary>
    /// Deletes multiple template resources based on their unique identifiers.
    /// </summary>
    /// <param name="templateResourceIds">A collection of unique identifiers representing the template resources to be deleted.</param>
    /// <returns>A service response indicating the success or failure of the batch delete operation.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleTemplateResourcesAsync(IEnumerable<Guid> templateResourceIds);
}
