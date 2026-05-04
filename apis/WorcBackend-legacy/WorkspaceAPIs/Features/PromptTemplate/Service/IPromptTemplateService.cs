namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the service operations for managing prompt templates, including availability checks, 
/// CRUD (Create, Read, Update, Delete) operations, and bulk deletion of prompt templates.
/// </summary>
public interface IPromptTemplateService
{
    /// <summary>
    /// Checks the availability of a specific prompt template name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the template name and other relevant context to verify availability.</param>
    /// <returns>A ServiceResponse containing a TrueFalseResultDto indicating whether the template name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsPromptTemplateNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves all prompt templates.
    /// </summary>
    /// <returns>A ServiceResponse containing a collection of PromptTemplateTableDto objects.</returns>
    Task<ServiceResponse<IEnumerable<PromptTemplateTableDto>>> GetAllPromptTemplatesAsync();

    /// <summary>
    /// Retrieves a specific prompt template by its unique identifier.
    /// </summary>
    /// <param name="promptTemplateId">The unique identifier for the prompt template.</param>
    /// <returns>A ServiceResponse containing the details of the specified prompt template.</returns>
    Task<ServiceResponse<PromptTemplateTableDto>> GetPromptTemplateAsync(Guid promptTemplateId);

    /// <summary>
    /// Retrieves a specific prompt template by its name.
    /// </summary>
    /// <param name="promptTemplateName">The name of the prompt template.</param>
    /// <returns>A ServiceResponse containing the details of the specified prompt template.</returns>
    Task<ServiceResponse<PromptTemplateTableDto>> GetPromptTemplateByNameAsync(string promptTemplateName);

    /// <summary>
    /// Inserts a new prompt template into the system.
    /// </summary>
    /// <param name="promptTemplateDto">The DTO containing the prompt template data to be added.</param>
    /// <returns>A ServiceResponse containing the details of the newly created prompt template.</returns>
    Task<ServiceResponse<PromptTemplateTableDto>> InsertPromptTemplateAsync(PromptTemplateTableDto promptTemplateDto);

    /// <summary>
    /// Updates an existing prompt template in the system.
    /// </summary>
    /// <param name="promptTemplateDto">The DTO containing the updated prompt template data.</param>
    /// <returns>A ServiceResponse containing the updated details of the prompt template.</returns>
    Task<ServiceResponse<PromptTemplateTableDto>> UpdatePromptTemplateAsync(PromptTemplateTableDto promptTemplateDto);

    /// <summary>
    /// Deletes a specific prompt template by its unique identifier.
    /// </summary>
    /// <param name="promptTemplateId">The unique identifier of the prompt template to be deleted.</param>
    /// <returns>A ServiceResponse indicating whether the deletion was successful or not.</returns>
    Task<ServiceResponse<bool>> DeletePromptTemplateAsync(Guid promptTemplateId);

    /// <summary>
    /// Deletes multiple prompt templates based on a list of unique identifiers.
    /// </summary>
    /// <param name="promptTemplateIds">The list of unique identifiers for the prompt templates to be deleted.</param>
    /// <returns>A ServiceResponse indicating the success or failure of the bulk deletion process.</returns>
    Task<ServiceResponse<bool>> DeleteMultiplePromptTemplatesAsync(IEnumerable<Guid> promptTemplateIds);

    /// <summary>
    /// Searches for prompt templates by their name, returning templates that match the provided search term.
    /// </summary>
    /// <param name="templateName">The name (or part of the name) of the prompt templates to search for.</param>
    /// <returns>A ServiceResponse containing a collection of prompt template DTOs that match the search term.</returns>
    Task<ServiceResponse<IEnumerable<PromptTemplateTableDto>>> SearchPromptTemplatesByNameAsync(string templateName);
}