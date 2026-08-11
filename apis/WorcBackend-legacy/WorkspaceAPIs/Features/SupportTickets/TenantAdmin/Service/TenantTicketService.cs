namespace WorkspaceAPIs.Services;

public class TenantTicketService : TicketServiceBase, ITenantTicketService
{
    public TenantTicketService(
        ILogger<TenantTicketService> logger,
        IUnitOfWork unitOfWork,
        WorkspaceDbContext workspaceDbContext,
        TenantDbContext tenantDbContext,
        IHttpContextAccessor httpContextAccessor,
        INotificationHelperService notificationHelperService,
        INotificationEventService notificationEventService,
        IUploadFileService uploadFileService)
        : base(logger, unitOfWork, workspaceDbContext, tenantDbContext, httpContextAccessor, notificationHelperService, notificationEventService, uploadFileService)
    {
    }

    // Block change requests unless the tenant has enabled them.
    protected override async Task ValidateCreateAsync(TicketTableDto ticketDto, RequestTypeEnum requestType)
    {
        if (requestType != RequestTypeEnum.ChangeRequest) return;

        var tenant = await TenantDbContext.ReadOnlyTenants
            .Where(w => w.Id == UserTenantId)
            .SingleOrDefaultAsync();

        if (tenant == null || !tenant.IsChangeRequestEnabled)
        {
            var error = new InvalidOperationException("Change Requests are not enabled for this tenant");
            error.Data["StatusCode"] = 403;
            throw error;
        }
    }

    // Retrieves a ticket by its ID.
    public override async Task<ServiceResponse<TicketDto>> GetTicketAsync(Guid ticketId) => await base.GetTicketAsync(ticketId);

    // Retrieves list of tickets.
    public override async Task<ServiceResponse<IEnumerable<TicketTableDto>>> GetTicketsAsync() => await base.GetTicketsAsync();

    // Insert a new ticket.
    public override async Task<ServiceResponse<TicketDto>> CreateTicketAsync(TicketTableDto ticketDto) => await base.CreateTicketAsync(ticketDto);

    // Updates an existing ticket.
    public override async Task<ServiceResponse<TicketDto>> UpdateTicketAsync(TicketTableDto ticketDto) => await base.UpdateTicketAsync(ticketDto);

    // Deletes an existing ticket.
    public override async Task<ServiceResponse<bool>> DeleteTicketAsync(Guid ticketId) => await base.DeleteTicketAsync(ticketId);

    // Deletes multiple tickets by their IDs.
    public override async Task<ServiceResponse<int>> DeleteMultipleTicketsAsync(IEnumerable<Guid> ticketIds) => await base.DeleteMultipleTicketsAsync(ticketIds);

    // Updates the status of an existing ticket.
    public override async Task<ServiceResponse<TicketDto>> UpdateTicketStatusAsync(TicketStatusUpdateDto statusUpdateDto) => await base.UpdateTicketStatusAsync(statusUpdateDto);

    // Updates the triage information of an existing ticket.
    public override async Task<ServiceResponse<TicketDto>> UpdateTicketTriageAsync(TicketTriageUpdateDto triageUpdateDto) => await base.UpdateTicketTriageAsync(triageUpdateDto);

    // Retrieves list of comments for a ticket.
    public override async Task<ServiceResponse<IEnumerable<TicketCommentDto>>> GetCommentsAsync(Guid ticketId) => await base.GetCommentsAsync(ticketId);

    // Inserts a new comment on a ticket.
    public override async Task<ServiceResponse<TicketCommentDto>> CreateCommentAsync(TicketCommentDto commentDto) => await base.CreateCommentAsync(commentDto);

    // Updates an existing comment on a ticket.
    public override async Task<ServiceResponse<TicketCommentDto>> UpdateCommentAsync(TicketCommentDto commentDto) => await base.UpdateCommentAsync(commentDto);

    // Deletes an existing comment on a ticket.
    public override async Task<ServiceResponse<bool>> DeleteCommentAsync(Guid commentId) => await base.DeleteCommentAsync(commentId);

    // Retrieves list of attachments for a ticket.
    public override async Task<ServiceResponse<IEnumerable<TicketAttachmentDto>>> GetAttachmentsAsync(Guid ticketId) => await base.GetAttachmentsAsync(ticketId);

    // Inserts a new attachment on a ticket.
    public override async Task<ServiceResponse<TicketAttachmentDto>> CreateAttachmentAsync(TicketAttachmentDto attachmentDto) => await base.CreateAttachmentAsync(attachmentDto);

    // Deletes an existing attachment on a ticket.
    public override async Task<ServiceResponse<bool>> DeleteAttachmentAsync(Guid attachmentId) => await base.DeleteAttachmentAsync(attachmentId);

    // Retrieves the history of a ticket.
    public override async Task<ServiceResponse<IEnumerable<TicketHistoryDto>>> GetHistoryAsync(Guid ticketId) => await base.GetHistoryAsync(ticketId);
}
