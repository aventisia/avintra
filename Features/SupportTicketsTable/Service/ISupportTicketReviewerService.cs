namespace WorkspaceAPIs.Services;

public interface ISupportTicketReviewerService
{
    /// <summary>
    /// Retrieves a support ticket associated with reviewer by ticketId/ticketNumber.
    /// </summary>
    /// <param name="ticketId">The ID of the support ticket.</param>
    /// <returns> The task result contains the service response with the support ticket DTO.</returns>
    Task<ServiceResponse<SupportTicketsTableDto>> GetSupportTicketAsync(string ticketId);

    /// <summary>
    /// Retrieves all support tickets associated with a reviewer.
    /// </summary>
    /// <returns>The task result contains the service response with the collection of support ticket DTOs.</returns>
    Task<ServiceResponse<IEnumerable<SupportTicketsTableDto>>> GetSupportTicketsAsync();

    /// <summary>
    /// Insert a new remark to the existing support ticket.
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

    /// <summary>
    /// Inserts a new support ticket.
    /// </summary>
    /// <param name="supportTicketsTableDto">The submitted form data for creating a new support ticket.</param>
    /// <returns> The task result contains the service response with the ID of the newly created support ticket.</returns>
    Task<ServiceResponse<SupportTicketsTableDto>> InsertSupportTicketAsync(SupportTicketsTableDto supportTicketsTableDto);

    /// <summary>
    /// Updates an existing support ticket status.
    /// </summary>
    /// <param name="stUpdateByReviewerDto">The submitted form data for updating an existing support ticket.</param>
    /// <returns> The task result contains the service response with the updated support ticket DTO.</returns>
    Task<ServiceResponse<SupportTicketsTableDto>> UpdateSupportTicketAsync(STUpdateByReviewerDto stUpdateByReviewerDto);
}
