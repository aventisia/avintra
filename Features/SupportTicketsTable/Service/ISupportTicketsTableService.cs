namespace WorkspaceAPIs.Services;

public interface ISupportTicketsTableService
{
    /// <summary>
    /// Retrieves a support ticket by its ID/ticketNumber.
    /// </summary>
    /// <param name="id">The ID of the support ticket.</param>
    /// <returns> The task result contains the service response with the support ticket DTO.</returns>
    Task<ServiceResponse<SupportTicketsTableDto>> GetSupportTicketAsync(string id);

    /// <summary>
    /// Retrieves all support tickets.
    /// </summary>
    /// <returns> The task result contains the service response with the collection of support ticket DTOs.</returns>
    Task<ServiceResponse<IEnumerable<SupportTicketsTableDto>>> GetSupportTicketsAsync();

    /// <summary>
    /// Retrieves all support tickets.
    /// </summary>
    /// <returns> The task result contains the service response with the collection of support ticket DTOs.</returns>
    //  Task<ServiceResponse<IEnumerable<SupportTicketsTableDto>>> GetAllSupportTicketsAsync();

    /// <summary>
    /// Inserts a new support ticket.
    /// </summary>
    /// <param name="supportTicketsTableDto">The submitted form data for creating a new support ticket.</param>
    /// <returns> The task result contains the service response with the ID of the newly created support ticket.</returns>
    Task<ServiceResponse<SupportTicketsTableDto>> InsertSupportTicketAsync(SupportTicketsTableDto supportTicketsTableDto);

    /// <summary>
    /// Updates an existing support ticket.
    /// </summary>
    /// <param name="supportTicketsTableDto">The submitted form data for updating an existing support ticket.</param>
    /// <returns> The task result contains the service response with the updated support ticket DTO.</returns>
    Task<ServiceResponse<SupportTicketsTableDto>> UpdateSupportTicketAsync(SupportTicketsTableDto supportTicketsTableDto);

    /// <summary>
    /// Updates an existing support ticket status by reviewer.
    /// </summary>
    /// <param name="stUpdateByReviewerDto">The submitted form data for updating an existing support ticket.</param>
    /// <returns> The task result contains the service response with the updated support ticket DTO.</returns>
    Task<ServiceResponse<SupportTicketsTableDto>> UpdateSupportTicketStatusAsync(STUpdateByReviewerDto stUpdateByReviewerDto);

    /// <summary>
    /// Deletes a support ticket from the database permanently, if allowed and if deleting relationship records is possible or allowed.
    /// </summary>
    /// <param name="id">The ID of the support ticket to delete.</param>
    /// <returns> The task result contains the service response with a boolean indicating whether the delete was successful or not.</returns>
    Task<ServiceResponse<bool>> DeleteSupportTicketAsync(Guid id);
}