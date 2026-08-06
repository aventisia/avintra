namespace WorkspaceAPIs.Services;

public interface ITenantTicketService
{
    Task<ServiceResponse<TicketDto>> GetTicketAsync(Guid ticketId);

    Task<ServiceResponse<IEnumerable<TicketTableDto>>> GetTicketsAsync();

    Task<ServiceResponse<TicketDto>> CreateTicketAsync(TicketTableDto ticketDto);

    Task<ServiceResponse<TicketDto>> UpdateTicketAsync(TicketTableDto ticketDto);

    Task<ServiceResponse<bool>> DeleteTicketAsync(Guid ticketId);

    Task<ServiceResponse<int>> DeleteMultipleTicketsAsync(IEnumerable<Guid> ticketIds);

    Task<ServiceResponse<TicketDto>> UpdateTicketStatusAsync(TicketStatusUpdateDto statusUpdateDto);

    Task<ServiceResponse<TicketDto>> UpdateTicketTriageAsync(TicketTriageUpdateDto triageUpdateDto);

    Task<ServiceResponse<IEnumerable<TicketCommentDto>>> GetCommentsAsync(Guid ticketId);

    Task<ServiceResponse<TicketCommentDto>> CreateCommentAsync(TicketCommentDto commentDto);

    Task<ServiceResponse<TicketCommentDto>> UpdateCommentAsync(TicketCommentDto commentDto);

    Task<ServiceResponse<bool>> DeleteCommentAsync(Guid commentId);

    Task<ServiceResponse<IEnumerable<TicketAttachmentDto>>> GetAttachmentsAsync(Guid ticketId);

    Task<ServiceResponse<TicketAttachmentDto>> CreateAttachmentAsync(TicketAttachmentDto attachmentDto);

    Task<ServiceResponse<bool>> DeleteAttachmentAsync(Guid attachmentId);

    Task<ServiceResponse<IEnumerable<TicketHistoryDto>>> GetHistoryAsync(Guid ticketId);
}
