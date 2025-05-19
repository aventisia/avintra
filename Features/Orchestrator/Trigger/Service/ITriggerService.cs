namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing trigger-related operations.
/// </summary>
public interface ITriggerService
{
    /// <summary>
    /// Checks the availability of a trigger name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the trigger name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the trigger name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Creates a new trigger.
    /// </summary>
    /// <param name="triggerDto">The trigger details.</param>
    /// <returns>A service response containing the created trigger data.</returns>
    Task<ServiceResponse<TriggerDto>> CreateNewTriggerAsync(TriggerDto triggerDto);

    /// <summary>
    /// Retrieves a list of all triggers.
    /// </summary>
    /// <returns>A service response containing a collection of triggers.</returns>
    Task<ServiceResponse<IEnumerable<TriggerDto>>> GetTriggerListAsync();

    /// <summary>
    /// Deletes a specific trigger.
    /// </summary>
    /// <param name="triggerId">The unique identifier of the trigger to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteTriggerAsync(Guid triggerId);

    /// <summary>
    /// Retrieves details of a specific trigger.
    /// </summary>
    /// <param name="triggerId">The unique identifier of the trigger.</param>
    /// <returns>A service response containing the trigger details.</returns>
    Task<ServiceResponse<TriggerDto>> GetTriggerAsync(Guid triggerId);

    /// <summary>
    /// Updates an existing trigger.
    /// </summary>
    /// <param name="triggerDto">The updated trigger details.</param>
    /// <returns>A service response containing the updated trigger data.</returns>
    Task<ServiceResponse<TriggerDto>> UpdateTriggerAsync(TriggerDto triggerDto);

    /// <summary>
    /// Deletes multiple triggers.
    /// </summary>
    /// <param name="triggerIds">A collection of trigger IDs to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteTriggersAsync(IEnumerable<Guid> triggerIds);

    /// <summary>
    /// Retrieves a list of agents assigned to a trigger asynchronously.
    /// </summary>
    /// <param name="triggerId">The ID of the trigger for which assigned agents will be retrieved.</param>
    /// <returns>A service response containing a list of agents assigned to the specified trigger.</returns>
    Task<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>> GetAgentsByTriggerAsync(Guid triggerId);

    /// <summary>
    /// Retrieves a list of triggers formatted as select options.
    /// </summary>
    /// <returns>A service response containing a list of select options for triggers, including labels, values, and descriptions.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetTriggerToSelectOptionAsync();
}