namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing trigger-related operations.
/// </summary>
public interface ITimeTriggerService
{
    /// <summary>
    /// Checks the availability of a time trigger name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the time trigger name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the trigger name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsTimeTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Creates a new time trigger.
    /// </summary>
    /// <param name="triggerDto">The trigger details.</param>
    /// <returns>A service response containing the created trigger data.</returns>
    Task<ServiceResponse<TimeTriggerDto>> CreateNewTimeTriggerAsync(TimeTriggerDto triggerDto);

    /// <summary>
    /// Retrieves a list of all time triggers.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal time triggers. If <c>false</c>, returns only shared time triggers. </param>
    /// <returns>A service response containing a collection of time triggers.</returns>
    Task<ServiceResponse<IEnumerable<TimeTriggerDto>>> GetTimeTriggerListAsync(bool isPersonal);

    /// <summary>
    /// Deletes a specific time trigger.
    /// </summary>
    /// <param name="timeTriggerId">The unique identifier of the time trigger to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteTimeTriggerAsync(Guid timeTriggerId);

    /// <summary>
    /// Retrieves details of a specific time trigger.
    /// </summary>
    /// <param name="timeTriggerId">The unique identifier of the time trigger.</param>
    /// <returns>A service response containing the trigger details.</returns>
    Task<ServiceResponse<TimeTriggerDto>> GetTimeTriggerAsync(Guid timeTriggerId);

    /// <summary>
    /// Updates an existing time trigger.
    /// </summary>
    /// <param name="triggerDto">The updated time trigger details.</param>
    /// <returns>A service response containing the updated trigger data.</returns>
    Task<ServiceResponse<TimeTriggerDto>> UpdateTimeTriggerAsync(TimeTriggerDto triggerDto);

    /// <summary>
    /// Deletes multiple time triggers.
    /// </summary>
    /// <param name="timeTriggerIds">A collection of time trigger IDs to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteTimeTriggersAsync(IEnumerable<Guid> timeTriggerIds);

    /// <summary>
    /// Retrieves a list of agents assigned to a trigger asynchronously.
    /// </summary>
    /// <param name="timeTriggerId">The ID of the trigger for which assigned agents will be retrieved.</param>
    /// <returns>A service response containing a list of agents assigned to the specified trigger.</returns>
    Task<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>> GetAgentsByTriggerAsync(Guid timeTriggerId);

    /// <summary>
    /// Retrieves a list of triggers formatted as select options.
    /// </summary>
    /// <returns>A service response containing a list of select options for triggers, including labels, values, and descriptions.</returns>
    //Task<ServiceResponse<IEnumerable<SelectOption>>> GetTriggerToSelectOptionAsync();
}