namespace AccountsAPIs.Services;

/// <summary>
/// Defines the service operations for managing AI tasks, including availability checks, 
/// CRUD (Create, Read, Update, Delete) operations, and bulk deletion of AI tasks.
/// </summary>
public interface IAITaskService
{
    /// <summary>
    /// Checks the availability of a specific AI task name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the task name and other relevant context to verify availability.</param>
    /// <returns>A ServiceResponse containing a TrueFalseResultDto indicating whether the task name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsAITaskNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves all AI tasks.
    /// </summary>
    /// <returns>A ServiceResponse containing a collection of AITaskTableDto objects.</returns>
    Task<ServiceResponse<IEnumerable<AITaskTableDto>>> GetAllAITasksAsync();

    /// <summary>
    /// Retrieves a specific AI task by its unique identifier.
    /// </summary>
    /// <param name="aiTaskId">The unique identifier for the AI task.</param>
    /// <returns>A ServiceResponse containing the details of the specified AI task.</returns>
    Task<ServiceResponse<AITaskTableDto>> GetAITaskAsync(Guid aiTaskId);

    /// <summary>
    /// Retrieves a specific AI task by its name.
    /// </summary>
    /// <param name="aiTaskName">The name of the AI task.</param>
    /// <returns>A ServiceResponse containing the details of the specified AI task.</returns>
    Task<ServiceResponse<AITaskTableDto>> GetAITaskByNameAsync(string aiTaskName);

    /// <summary>
    /// Inserts a new AI task into the system.
    /// </summary>
    /// <param name="aiTaskDto">The DTO containing the AI task data to be added.</param>
    /// <returns>A ServiceResponse containing the details of the newly created AI task.</returns>
    Task<ServiceResponse<AITaskTableDto>> InsertAITaskAsync(AITaskTableDto aiTaskDto);

    /// <summary>
    /// Updates an existing AI task in the system.
    /// </summary>
    /// <param name="aiTaskDto">The DTO containing the updated AI task data.</param>
    /// <returns>A ServiceResponse containing the updated details of the AI task.</returns>
    Task<ServiceResponse<AITaskTableDto>> UpdateAITaskAsync(AITaskTableDto aiTaskDto);

    /// <summary>
    /// Deletes a specific AI task by its unique identifier.
    /// </summary>
    /// <param name="aiTaskId">The unique identifier of the AI task to be deleted.</param>
    /// <returns>A ServiceResponse indicating whether the deletion was successful or not.</returns>
    Task<ServiceResponse<bool>> DeleteAITaskAsync(Guid aiTaskId);

    /// <summary>
    /// Deletes multiple AI tasks based on a list of unique identifiers.
    /// </summary>
    /// <param name="aiTaskIds">The list of unique identifiers for the AI tasks to be deleted.</param>
    /// <returns>A ServiceResponse indicating the success or failure of the bulk deletion process.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleAITasksAsync(IEnumerable<Guid> aiTaskIds);

    /// <summary>
    /// Searches for AI tasks by their name, returning tasks that match the provided search term.
    /// </summary>
    /// <param name="taskName">The name (or part of the name) of the AI tasks to search for.</param>
    /// <returns>A ServiceResponse containing a collection of AI task DTOs that match the search term.</returns>
    Task<ServiceResponse<IEnumerable<AITaskTableDto>>> SearchAITasksByNameAsync(string taskName);
}