namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing message trigger-related operations.
/// </summary>
public interface IMessageTriggerService
{
    /// <summary>
    /// Retrieves a list of all message triggers.
    /// </summary>
    /// <returns>A service response containing a collection of message triggers.</returns>
    Task<ServiceResponse<IEnumerable<MessageTriggerDto>>> GetMessageTriggerListAsync();

    /// <summary>
    /// Retrieves the details of a specific message trigger.
    /// </summary>
    /// <param name="triggerId">The unique identifier of the message trigger.</param>
    /// <returns>A service response containing the message trigger details.</returns>
    Task<ServiceResponse<MessageTriggerDto>> GetMessageTriggerAsync(Guid triggerId);

    /// <summary>
    /// Creates a new message trigger.
    /// </summary>
    /// <param name="messageTriggerDto">The message trigger details.</param>
    /// <returns>A service response containing the created message trigger data.</returns>
    Task<ServiceResponse<MessageTriggerDto>> CreateMessageTriggerAsync(MessageTriggerDto messageTriggerDto);

    /// <summary>
    /// Updates an existing message trigger.
    /// </summary>
    /// <param name="messageTriggerDto">The updated message trigger details.</param>
    /// <returns>A service response containing the updated message trigger data.</returns>
    Task<ServiceResponse<MessageTriggerDto>> UpdateMessageTriggerAsync(MessageTriggerDto messageTriggerDto);

    /// <summary>
    /// Deletes a specific message trigger.
    /// </summary>
    /// <param name="triggerId">The unique identifier of the message trigger to delete.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteMessageTriggerAsync(Guid triggerId);

    /// <summary>
    /// Deletes multiple message triggers.
    /// </summary>
    /// <param name="triggerIds">A collection of message trigger IDs to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteMessageTriggersAsync(IEnumerable<Guid> triggerIds);

    /// <summary>
    /// Checks the availability of a message trigger name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the message trigger name to check.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains
    /// a ServiceResponse with a TrueFalseResultDto
    /// indicating whether the message trigger name is available.
    /// </returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsMessageTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves a list of agents assigned to a specific message trigger.
    /// </summary>
    /// <param name="triggerId">The ID of the message trigger.</param>
    /// <returns>A service response containing the agents assigned to the message trigger.</returns>
    Task<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>> GetAgentsByMessageTriggerAsync(Guid triggerId);

    /// <summary>
    /// Receives an external notification and initiates job creation based on the provided trigger ID.
    /// </summary>
    /// <param name="triggerId">
    /// The unique identifier of the message trigger.
    /// </param>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> indicating whether the job was created successfully.
    /// </returns>
    Task<ServiceResponse<bool>> CreateJobByMessageTriggerIdAsync(string triggerId);
}
