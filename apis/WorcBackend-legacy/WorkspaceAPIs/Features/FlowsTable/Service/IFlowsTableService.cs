namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing flows.
/// </summary>
public interface IFlowsTableService
{
    /// <summary>
    /// Retrieves all flows created by the user.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal flows. If <c>false</c>, returns only shared flows. </param>
    /// <param name="includeArchived"> If <c>true</c>, includes flows whose latest version is archived. </param>
    /// <returns>The task result contains the service response with the list of flow details.</returns>
    Task<ServiceResponse<IEnumerable<FlowsTableDto>>> GetFlowsAsync(bool isPersonal, bool includeArchived = false);

    /// <summary>
    /// Checks the availability of a flow name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the flow name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the flow name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsFlowNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

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
    /// Moves an existing flow into a folder, or to the top level when no folder is given.
    /// </summary>
    /// <param name="updateFlowFolderDto">The flow and its target folder.</param>
    /// <returns>The task result contains the service response indicating whether the flow was moved.</returns>
    Task<ServiceResponse<bool>> UpdateFlowFolderAsync(UpdateFlowFolderDto updateFlowFolderDto);

    /// <summary>
    /// Deletes a flow by its ID.
    /// </summary>
    /// <param name="id">The ID of the flow to delete.</param>
    /// <returns>The task result contains the service response indicating whether the flow was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteFlowAsync(Guid id);

    /// <summary>
    /// Deletes multiple flows by their IDs.
    /// </summary>
    /// <param name="ids">The IDs of the flows to delete.</param>
    /// <returns>The task result contains the service response indicating whether the flows were successfully deleted.</returns>
    /// <remarks>
    /// It is recommended to use this method to delete multiple flows at once to reduce the number of requests to the server.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteFlowsAsync(List<Guid> ids);
}