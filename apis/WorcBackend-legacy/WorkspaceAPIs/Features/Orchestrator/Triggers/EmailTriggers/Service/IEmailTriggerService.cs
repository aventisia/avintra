namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing email trigger-related operations.
/// </summary>
public interface IEmailTriggerService
{
    /// <summary>
    /// Retrieves a list of all email triggers.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal email triggers. If <c>false</c>, returns only shared email triggers. </param>
    /// <returns>A service response containing a collection of email triggers.</returns>
    Task<ServiceResponse<IEnumerable<EmailTriggerDto>>> GetEmailTriggerListAsync(bool isPersonal);

    /// <summary>
    /// Retrieves the details of a specific email trigger.
    /// </summary>
    /// <param name="triggerId">The unique identifier of the email trigger.</param>
    /// <returns>A service response containing the email trigger details.</returns>
    Task<ServiceResponse<EmailTriggerDto>> GetEmailTriggerAsync(Guid triggerId);

    /// <summary>
    /// Creates a new email trigger.
    /// </summary>
    /// <param name="emailTriggerDto">The email trigger details.</param>
    /// <returns>A service response containing the created email trigger data.</returns>
    Task<ServiceResponse<EmailTriggerDto>> CreateEmailTriggerAsync(EmailTriggerDto emailTriggerDto);

    /// <summary>
    /// Updates an existing email trigger.
    /// </summary>
    /// <param name="emailTriggerDto">The updated email trigger details.</param>
    /// <returns>A service response containing the updated email trigger data.</returns>
    Task<ServiceResponse<EmailTriggerDto>> UpdateEmailTriggerAsync(EmailTriggerDto emailTriggerDto);

    /// <summary>
    /// Deletes a specific email trigger.
    /// </summary>
    /// <param name="triggerId">The unique identifier of the email trigger to delete.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteEmailTriggerAsync(Guid triggerId);

    /// <summary>
    /// Deletes multiple email triggers.
    /// </summary>
    /// <param name="triggerIds">A collection of email trigger IDs to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteEmailTriggersAsync(IEnumerable<Guid> triggerIds);

    /// <summary>
    /// Checks the availability of an email trigger name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the email trigger name to check.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains
    /// a <see cref="ServiceResponse{T}"/> with a <see cref="TrueFalseResultDto"/>
    /// indicating whether the email trigger name is available.
    /// </returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsEmailTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves a list of agents assigned to a specific email trigger.
    /// </summary>
    /// <param name="triggerId">The ID of the email trigger.</param>
    /// <returns>A service response containing the agents assigned to the email trigger.</returns>
    Task<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>> GetAgentsByEmailTriggerAsync(Guid triggerId);

    /// <summary>
    /// Receives an external notification and initiates job creation based on the provided trigger ID.
    /// </summary>
    /// <param name="triggerId"> The unique identifier of the message trigger. </param>
    /// <param name="payload"> Notification payload received from the email trigger. <returns>
    /// A <see cref="ServiceResponse{T}"/> indicating whether the job was created successfully.
    /// </returns>
    Task<ServiceResponse<bool>> CreateJobByEmailTriggerIdAsync(string triggerId, JsonElement payload);
}