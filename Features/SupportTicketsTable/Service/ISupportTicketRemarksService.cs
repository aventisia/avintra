namespace WorkspaceAPIs.Services;

public interface ISupportTicketRemarksService
{
    /// <summary>
    /// Create a new support ticket remark.
    /// </summary>
    /// <param name="supportTicketRemarksDto">The DTO containing the data for the new support ticket remark.</param>
    /// <returns> The task result contains the service response with the inserted record DTO.</returns>
    Task<ServiceResponse<SupportTicketRemarksDto>> InsertSupportTicketRemarkAsync(SupportTicketRemarksDto supportTicketRemarksDto);

    /// <summary>
    /// Update the support ticket remark with IsEdited flag
    /// </summary>
    /// <param name="supportTicketRemarksDto">The DTO containing the updated data for the support ticket remark.</param>
    /// <returns> The task result contains the service response with a boolean indicating the success of the update operation.</returns>
    Task<ServiceResponse<SupportTicketRemarksDto>> UpdateSupportTicketRemarkAsync(SupportTicketRemarksDto supportTicketRemarksDto);

    /// <summary>
    /// Deletes support ticket remark permanently.
    /// </summary>
    /// <param name="id">The ID of the support ticket remark to delete.</param>
    /// <returns> The task result contains the service response with a boolean indicating the success of the delete operation.</returns>
    Task<ServiceResponse<bool>> DeleteSupportTicketRemarkAsync(Guid id);
}
