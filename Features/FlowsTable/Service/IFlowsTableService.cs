namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing flows.
/// </summary>
public interface IFlowsTableService
{
    /// <summary>
    /// Retrieves all flows associated with a project.
    /// </summary>
    /// <param name="projectId">The ID of the project.</param>
    /// <returns>The task result contains the service response with the list of flow details.</returns>
    Task<ServiceResponse<IEnumerable<FlowsTableDto>>> GetFlowsAsync(Guid projectId);

    /// <summary>
    /// Checks the availability of a flow name.
    /// </summary>
    /// <param name="projectId">The ID of the project.</param>
    /// <param name="checkAvailabilityDto">The DTO containing the flow name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the flow name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsFlowNameAvailableAsync(Guid projectId, CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Inserts a new flow.
    /// </summary>
    /// <param name="flowsTableDto">The data required to insert the flow.</param>
    /// <returns>The task result contains the service response with the inserted flow details.</returns>
    Task<ServiceResponse<FlowsTableDto>> InsertFlowAsync(FlowsTableDto flowsTableDto);

    /// <summary>
    /// Updates an existing flow.
    /// </summary>
    /// <param name="flowsTableDto">The data required to update the flow.</param>
    /// <returns>The task result contains the service response with the updated flow details.</returns>
    Task<ServiceResponse<FlowsTableDto>> UpdateFlowAsync(FlowsTableDto flowsTableDto);

    /// <summary>
    /// Deletes a flow by its ID.
    /// </summary>
    /// <param name="id">The ID of the flow to delete.</param>
    /// <returns>The task result contains the service response indicating whether the flow was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteFlowAsync(Guid id);
}