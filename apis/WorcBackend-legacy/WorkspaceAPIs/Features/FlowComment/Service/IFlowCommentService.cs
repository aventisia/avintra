namespace WorkspaceAPIs.Services;

public interface IFlowCommentService
{
    /// <summary>
    /// Gets list of flow comments of single flow using flow Id.
    /// </summary>
    /// <param name="flowId">Flow's record Id (Primary Key of Flow Entity)</param>
    /// <returns>List of flows comments linked to the provided flowId</returns>
    Task<ServiceResponse<IEnumerable<FlowCommentDto>>> GetFlowCommentsAsync(Guid flowId);

    /// <summary>
    /// Creates a new flow commment
    /// </summary>
    /// <param name="flowCommentDto">Message composer submitted data</param>
    /// <returns>Returns newly created flow comment</returns>
    Task<ServiceResponse<FlowCommentDto>> InsertFlowCommentAsync(FlowCommentDto flowCommentDto);

    /// <summary>
    /// Update the flow comment with IsEdited flag
    /// </summary>
    /// <param name="flowCommentDto">Message composer submitted data</param>
    /// <returns>Returns updtaed flow comment</returns>
    Task<ServiceResponse<FlowCommentDto>> UpdateFlowCommentAsync(FlowCommentDto flowCommentDto);

    /// <summary>
    /// Deletes flow comment permanently
    /// </summary>
    /// <param name="id">Flow comment Id (Primary Key)</param>
    /// <returns>True if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteFlowCommentAsync(Guid id);
}