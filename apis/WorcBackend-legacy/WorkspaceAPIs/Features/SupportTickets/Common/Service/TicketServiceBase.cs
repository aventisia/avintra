using System.Security.Claims;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Shared implementation for the tenant-admin and super-admin support ticket services.
/// Concrete services only need to pick the tenant scope (CrossTenant) and override
/// tenant-specific behaviour such as change-request validation or notifications.
/// </summary>
public abstract class TicketServiceBase
{
    protected readonly ILogger Logger;
    protected readonly IUnitOfWork UnitOfWork;
    protected readonly WorkspaceDbContext WorkspaceDbContext;
    protected readonly TenantDbContext TenantDbContext;
    protected readonly INotificationHelperService NotificationHelperService;
    protected readonly IUploadFileService UploadFileService;
    protected readonly Guid UserId;
    protected readonly Guid UserTenantId;
    protected readonly List<string> UserRoles;

    /// <summary>
    /// True when the service runs in super-admin scope (queries across all tenants,
    /// bypassing the tenant query filter). False for tenant-admin scope.
    /// </summary>
    protected bool CrossTenant => IsAgent();

    protected TicketServiceBase(
        ILogger logger,
        IUnitOfWork unitOfWork,
        WorkspaceDbContext workspaceDbContext,
        TenantDbContext tenantDbContext,
        IHttpContextAccessor httpContextAccessor,
        INotificationHelperService notificationHelperService,
        IUploadFileService uploadFileService)
    {
        UserId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        UserTenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        UserRoles = httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? new List<string>();
        Logger = logger;
        UnitOfWork = unitOfWork;
        WorkspaceDbContext = workspaceDbContext;
        TenantDbContext = tenantDbContext;
        NotificationHelperService = notificationHelperService;
        UploadFileService = uploadFileService;
    }

    // True when the caller holds the super-admin ("SA") role.
    protected bool IsAgent()
    {
        return UserRoles.Contains("SA");
    }

    // Npgsql only accepts UTC (offset 0) DateTimeOffset values, so normalize
    // any client-supplied date to UTC before persisting.
    protected static DateTimeOffset? ToUtc(DateTimeOffset? value)
    {
        return value?.ToUniversalTime();
    }

    // Base ticket query; bypasses the tenant filter when scoped across tenants.
    protected IQueryable<Ticket> GetTicketQuery(bool crossTenant)
    {
        return crossTenant
            ? UnitOfWork.TicketRepo.GetByConditionAsync(w => true).IgnoreQueryFilters()
            : UnitOfWork.TicketRepo.GetByConditionAsync(w => true);
    }

    // Loads a ticket with its user/comment/attachment/history graph.
    protected async Task<Ticket?> GetTicketByIdAsync(Guid ticketId, bool crossTenant)
    {
        var ticketQuery = UnitOfWork.TicketRepo.GetByConditionAsync(w => w.Id == ticketId)
            .Include(i => i.CreatedByUser)
            .Include(i => i.LastModifiedByUser)
            .Include(i => i.Comments)
            .Include(i => i.Attachments)
            .Include(i => i.History);

        return crossTenant
            ? await ticketQuery.IgnoreQueryFilters().SingleOrDefaultAsync()
            : await ticketQuery.SingleOrDefaultAsync();
    }

    /// <summary>
    /// Resolves the ticket used by the current scope (cross-tenant vs tenant-scoped).
    /// </summary>
    protected Task<Ticket?> GetScopedTicketAsync(Guid ticketId)
    {
        return GetTicketByIdAsync(ticketId, CrossTenant);
    }

    // Logs an audit entry onto a ticket's history.
    protected async Task AddHistoryEntryAsync(Guid ticketId, string action, string? fieldName, string? oldValue, string? newValue)
    {
        var changedByUser = await UnitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == UserId).SingleOrDefaultAsync();
        var historyEntry = new TicketHistory
        {
            TicketId = ticketId,
            Action = action,
            FieldName = fieldName,
            OldValue = oldValue,
            NewValue = newValue,
            ChangedByUserId = UserId,
            ChangedByName = changedByUser != null ? $"{changedByUser.FirstName} {changedByUser.LastName}" : null,
            ChangedOn = DateTimeOffset.UtcNow
        };
        await UnitOfWork.TicketHistoryRepo.InsertAsync(historyEntry);
    }

    // Sends an in-app notification to the given users.
    protected async Task SendNotificationAsync(Guid tenantId, Guid ticketId, string ticketNumber, string message, NotificationTypesEnum notificationType, List<Guid> recipientUserIds)
    {
        var notification = new Notification
        {
            TenantId = tenantId,
            Message = message,
            Type = notificationType,
            ActionUrl = $"/tenant/support/ticket/details?id={ticketId}",
            CreatedByUserId = UserId,
            CreatedOn = DateTimeOffset.UtcNow,
            LastModifiedByUserId = UserId,
        };
        await UnitOfWork.NotificationRepo.InsertAsync(notification);
        await UnitOfWork.SaveAsync();
        await NotificationHelperService.AddNotificationUsers(notification.Id, recipientUserIds);
        await UnitOfWork.SaveAsync();
    }

    // Hook: services may override to block ticket creation (e.g. change-request gate).
    protected virtual Task ValidateCreateAsync(TicketTableDto ticketDto, RequestTypeEnum requestType) => Task.CompletedTask;

    // Hook: services may override to silence notifications (e.g. super-admin scope).
    protected virtual bool NotifyEnabled => true;

    // Applies a single save and returns true on success.
    private async Task<bool> TrySaveAsync(string logMessage)
    {
        if (await UnitOfWork.SaveAsync()) return true;
        Logger.LogInformation("SaveChanges failed: {Message}", logMessage);
        return false;
    }

    // Retrieves a ticket by its ID.
    public virtual async Task<ServiceResponse<TicketDto>> GetTicketAsync(Guid ticketId)
    {
        var serviceResponse = ServiceResponse<TicketDto>.Create("Failed to retrieve ticket", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(ticketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            // Order comments so the newest appears last.
            if (ticket.Comments != null)
                ticket.Comments = ticket.Comments.OrderBy(o => o.CreatedOn).ToList();

            var ticketDto = ticket.Adapt<TicketDto>();

            // The list projection only carries counts, so attach the full
            // comment/attachment/history graph on the detail response.
            ticketDto.Comments = ticket.Comments?.Adapt<List<TicketCommentDto>>();
            ticketDto.Attachments = ticket.Attachments?.Adapt<List<TicketAttachmentDto>>();
            ticketDto.History = ticket.History?.Adapt<List<TicketHistoryDto>>();

            serviceResponse.Update("Ticket retrieved successfully", 200, ticketDto);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error retrieving ticket {Id}", ticketId);
        }

        return serviceResponse;
    }

    // Retrieves list of tickets.
    public virtual async Task<ServiceResponse<IEnumerable<TicketTableDto>>> GetTicketsAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<TicketTableDto>>.Create("Failed to retrieve tickets", 400);

        try
        {
            // Newest first; mapped at the database to keep the projection lean.
            var tickets = await GetTicketQuery(CrossTenant)
                .OrderByDescending(o => o.CreatedOn)
                .ProjectToType<TicketTableDto>()
                .ToListAsync();

            serviceResponse.Update("Tickets retrieved successfully", 200, tickets);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error retrieving tickets");
        }

        return serviceResponse;
    }

    // Insert a new ticket.
    public virtual async Task<ServiceResponse<TicketDto>> CreateTicketAsync(TicketTableDto ticketDto)
    {
        var serviceResponse = ServiceResponse<TicketDto>.Create("Failed to create ticket. Please try again", 400);

        try
        {
            ticketDto = TrimDtoStringPropsUtil.TrimDtoStringProps(ticketDto);

            // Scope-specific validation (e.g. change-request gate for tenants).
            await ValidateCreateAsync(ticketDto, ticketDto.RequestType);

            var newTicket = ticketDto.Adapt<Ticket>();
            newTicket.RequiredBy = ToUtc(ticketDto.RequiredBy);
            newTicket.RequestedTimeline = ToUtc(ticketDto.RequestedTimeline);

            newTicket.CreatedByUserId = UserId;
            newTicket.LastModifiedByUserId = UserId;
            newTicket.TicketNumber = ticketDto.RequestType == RequestTypeEnum.ServiceRequest
                ? "SR-" + DateTime.UtcNow.ToString("yyyyMMdd-HHmmss")
                : "CR-" + DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
            newTicket.Status = TicketStatusEnum.New;

            if (ticketDto.AgentRefId.HasValue)
            {
                // Resolve the published agent flow so its name can be cached on the ticket.
                var agent = await UnitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == ticketDto.AgentRefId.Value && w.IsPublished)
                    .Include(i => i.Flow)
                    .SingleOrDefaultAsync();

                if (agent == null)
                {
                    serviceResponse.Update("Selected agent not found or not published", 400);
                    return serviceResponse;
                }

                newTicket.AgentName = agent.Flow?.Name;
            }

            await UnitOfWork.TicketRepo.InsertAsync(newTicket);
            if (!await TrySaveAsync("creating ticket"))
                return serviceResponse;

            await AddHistoryEntryAsync(newTicket.Id, "Created", null, null, $"Ticket {newTicket.TicketNumber} created");

            if (!await TrySaveAsync("adding history entry"))
                return serviceResponse;

            if (NotifyEnabled)
            {
                await SendNotificationAsync(
                    newTicket.TenantId,
                    newTicket.Id,
                    newTicket.TicketNumber,
                    $"Your ticket '{newTicket.TicketNumber}' has been successfully created.",
                    NotificationTypesEnum.Information,
                    new List<Guid> { UserId });
            }

            serviceResponse.Update("Ticket created successfully", 200, newTicket.Adapt<TicketDto>());
        }
        catch (InvalidOperationException ex) when (ex.Data.Contains("StatusCode"))
        {
            // Scope-specific validation failure (e.g. change requests disabled for the tenant).
            serviceResponse.Update(ex.Message, (int)ex.Data["StatusCode"]!);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error creating ticket");
        }

        return serviceResponse;
    }

    // Updates an existing ticket.
    public virtual async Task<ServiceResponse<TicketDto>> UpdateTicketAsync(TicketTableDto ticketDto)
    {
        var serviceResponse = ServiceResponse<TicketDto>.Create("Failed to update ticket. Please try again", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(ticketDto.Id);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            ticketDto = TrimDtoStringPropsUtil.TrimDtoStringProps(ticketDto);

            ticket.Title = ticketDto.Title;
            ticket.Description = ticketDto.Description;
            ticket.RequiredBy = ToUtc(ticketDto.RequiredBy);
            ticket.AgentRefId = ticketDto.AgentRefId;
            ticket.ChangeSummary = ticketDto.ChangeSummary;
            ticket.ChangeReason = ticketDto.ChangeReason;
            ticket.ExpectedBehavior = ticketDto.ExpectedBehavior;
            ticket.RequestedTimeline = ToUtc(ticketDto.RequestedTimeline);
            ticket.Complexity = ticketDto.Complexity ?? ticket.Complexity;
            ticket.EstimatedEffortHours = ticketDto.EstimatedEffortHours;
            ticket.EstimatedCompletionDate = ToUtc(ticketDto.EstimatedCompletionDate);
            ticket.IsBillable = ticketDto.IsBillable;
            ticket.RequiresCustomerApproval = ticketDto.RequiresCustomerApproval;
            ticket.RiskLevel = ticketDto.RiskLevel ?? ticket.RiskLevel;
            ticket.Dependencies = ticketDto.Dependencies;
            ticket.TriageRemarks = ticketDto.TriageRemarks;
            ticket.IsDisabled = ticketDto.IsDisabled ?? ticket.IsDisabled;
            ticket.LastModifiedByUserId = UserId;
            ticket.LastModifiedOn = DateTimeOffset.UtcNow;

            UnitOfWork.TicketRepo.Update(ticket);

            if (!await TrySaveAsync("updating ticket"))
                return serviceResponse;

            await AddHistoryEntryAsync(ticket.Id, "Updated", null, null, $"Ticket {ticket.TicketNumber} updated");

            if (!await TrySaveAsync("adding history entry"))
                return serviceResponse;

            serviceResponse.Update("Ticket updated successfully", 200, ticket.Adapt<TicketDto>());
        }
        catch (DbUpdateConcurrencyException)
        {
            serviceResponse.Update("Ticket was modified by another user. Please refresh and try again.", 409);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error updating ticket");
        }

        return serviceResponse;
    }

    // Deletes an existing ticket.
    public virtual async Task<ServiceResponse<bool>> DeleteTicketAsync(Guid ticketId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete ticket. Please try again", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(ticketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            UnitOfWork.TicketRepo.Delete(ticket);

            if (!await TrySaveAsync("deleting ticket"))
                return serviceResponse;

            serviceResponse.Update("Ticket deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error deleting ticket");
        }

        return serviceResponse;
    }

    // Deletes multiple tickets by their IDs.
    public virtual async Task<ServiceResponse<int>> DeleteMultipleTicketsAsync(IEnumerable<Guid> ticketIds)
    {
        var serviceResponse = ServiceResponse<int>.Create("Failed to delete tickets. Please try again", 400);

        try
        {
            var ticketIdList = ticketIds.ToList();
            var ticketsToDelete = await GetTicketQuery(CrossTenant)
                .Where(w => ticketIdList.Contains(w.Id))
                .ToListAsync();

            if (ticketsToDelete.Count == 0)
            {
                serviceResponse.Update("No tickets found for deletion", 404);
                return serviceResponse;
            }

            UnitOfWork.TicketRepo.Delete(ticketsToDelete);

            if (!await TrySaveAsync("deleting tickets"))
                return serviceResponse;

            // Return the number of deleted records.
            serviceResponse.Update("Tickets deleted successfully", 200, ticketsToDelete.Count);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error deleting tickets");
        }

        return serviceResponse;
    }

    // Updates the status of an existing ticket.
    public virtual async Task<ServiceResponse<TicketDto>> UpdateTicketStatusAsync(TicketStatusUpdateDto statusUpdateDto)
    {
        var serviceResponse = ServiceResponse<TicketDto>.Create("Failed to update ticket status. Please try again", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(statusUpdateDto.TicketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            var oldStatus = ticket.Status.ToString();
            ticket.Status = statusUpdateDto.Status;
            ticket.LastModifiedByUserId = UserId;
            ticket.LastModifiedOn = DateTimeOffset.UtcNow;

            UnitOfWork.TicketRepo.Update(ticket);

            if (!await TrySaveAsync("updating ticket status"))
                return serviceResponse;

            await AddHistoryEntryAsync(ticket.Id, "StatusChanged", "Status", oldStatus, statusUpdateDto.Status.ToString());

            if (!await TrySaveAsync("adding history entry"))
                return serviceResponse;

            if (NotifyEnabled)
            {
                await SendNotificationAsync(
                    ticket.TenantId,
                    ticket.Id,
                    ticket.TicketNumber,
                    $"Your ticket '{ticket.TicketNumber}' status has been updated to {statusUpdateDto.Status}.",
                    NotificationTypesEnum.Alert,
                    new List<Guid> { ticket.CreatedByUserId });
            }

            serviceResponse.Update("Ticket status updated successfully", 200, ticket.Adapt<TicketDto>());
        }
        catch (DbUpdateConcurrencyException)
        {
            serviceResponse.Update("Ticket was modified by another user. Please refresh and try again.", 409);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error updating ticket status");
        }

        return serviceResponse;
    }

    // Updates the triage information of an existing ticket (change requests only).
    public virtual async Task<ServiceResponse<TicketDto>> UpdateTicketTriageAsync(TicketTriageUpdateDto triageUpdateDto)
    {
        var serviceResponse = ServiceResponse<TicketDto>.Create("Failed to update triage. Please try again", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(triageUpdateDto.TicketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            // Triage only applies to change requests.
            if (ticket.RequestType != RequestTypeEnum.ChangeRequest)
            {
                serviceResponse.Update("Triage can only be applied to change requests", 400);
                return serviceResponse;
            }

            ticket.Complexity = triageUpdateDto.Complexity ?? ticket.Complexity;
            ticket.RiskLevel = triageUpdateDto.RiskLevel ?? ticket.RiskLevel;
            ticket.EstimatedEffortHours = triageUpdateDto.EstimatedEffortHours;
            ticket.EstimatedCompletionDate = ToUtc(triageUpdateDto.EstimatedCompletionDate);
            ticket.IsBillable = triageUpdateDto.IsBillable;
            ticket.RequiresCustomerApproval = triageUpdateDto.RequiresCustomerApproval;
            ticket.Dependencies = triageUpdateDto.Dependencies;
            ticket.TriageRemarks = triageUpdateDto.TriageRemarks;
            ticket.LastModifiedByUserId = UserId;
            ticket.LastModifiedOn = DateTimeOffset.UtcNow;

            UnitOfWork.TicketRepo.Update(ticket);

            if (!await TrySaveAsync("updating triage"))
                return serviceResponse;

            await AddHistoryEntryAsync(ticket.Id, "TriageUpdated", "Triage", null, "Triage information updated");

            if (!await TrySaveAsync("adding history entry"))
                return serviceResponse;

            if (NotifyEnabled)
            {
                await SendNotificationAsync(
                    ticket.TenantId,
                    ticket.Id,
                    ticket.TicketNumber,
                    $"Your ticket '{ticket.TicketNumber}' triage information has been updated.",
                    NotificationTypesEnum.Information,
                    new List<Guid> { ticket.CreatedByUserId });
            }

            serviceResponse.Update("Triage updated successfully", 200, ticket.Adapt<TicketDto>());
        }
        catch (DbUpdateConcurrencyException)
        {
            serviceResponse.Update("Ticket was modified by another user. Please refresh and try again.", 409);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error updating triage");
        }

        return serviceResponse;
    }

    // Retrieves list of comments for a ticket.
    public virtual async Task<ServiceResponse<IEnumerable<TicketCommentDto>>> GetCommentsAsync(Guid ticketId)
    {
        var serviceResponse = ServiceResponse<IEnumerable<TicketCommentDto>>.Create("Failed to retrieve comments. Please try again", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(ticketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            var comments = await UnitOfWork.TicketCommentRepo
                .GetByConditionAsync(w => w.TicketId == ticketId)
                .OrderBy(w => w.CreatedOn)
                .ProjectToType<TicketCommentDto>()
                .ToListAsync();

            serviceResponse.Update("Comments retrieved successfully", 200, comments);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error retrieving comments for ticket {Id}", ticketId);
        }

        return serviceResponse;
    }

    // Inserts a new comment on a ticket.
    public virtual async Task<ServiceResponse<TicketCommentDto>> CreateCommentAsync(TicketCommentDto commentDto)
    {
        var serviceResponse = ServiceResponse<TicketCommentDto>.Create("Failed to add comment. Please try again", 400);

        try
        {
            commentDto = TrimDtoStringPropsUtil.TrimDtoStringProps(commentDto);

            var ticket = await GetScopedTicketAsync(commentDto.TicketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            // Closed tickets are read-only: no new comments can be added.
            if (ticket.Status == TicketStatusEnum.Closed)
            {
                serviceResponse.Update("Cannot add comments to a closed ticket", 400);
                return serviceResponse;
            }

            var newComment = commentDto.Adapt<TicketComment>();
            newComment.CreatedByUserId = UserId;
            newComment.LastModifiedByUserId = UserId;

            ticket.LastModifiedOn = DateTimeOffset.UtcNow;
            ticket.LastModifiedByUserId = UserId;

            await UnitOfWork.TicketCommentRepo.InsertAsync(newComment);

            if (!await TrySaveAsync("inserting comment"))
                return serviceResponse;

            // Attach the author so the DTO carries display info.
            newComment.CreatedByUser = await UnitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == UserId).SingleOrDefaultAsync();

            if (NotifyEnabled && ticket.CreatedByUserId != UserId)
            {
                await SendNotificationAsync(
                    ticket.TenantId,
                    ticket.Id,
                    ticket.TicketNumber,
                    $"A new comment has been added on your ticket '{ticket.TicketNumber}'.",
                    NotificationTypesEnum.Alert,
                    new List<Guid> { ticket.CreatedByUserId });
            }

            serviceResponse.Update("Comment added successfully", 200, newComment.Adapt<TicketCommentDto>());
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error creating comment");
        }

        return serviceResponse;
    }

    // Updates an existing comment on a ticket.
    public virtual async Task<ServiceResponse<TicketCommentDto>> UpdateCommentAsync(TicketCommentDto commentDto)
    {
        var serviceResponse = ServiceResponse<TicketCommentDto>.Create("Failed to update comment. Please try again", 400);

        try
        {
            // Users can only edit their own comments.
            var comment = await UnitOfWork.TicketCommentRepo
                .GetByConditionAsync(w => w.Id == commentDto.Id && w.CreatedByUserId == UserId)
                .SingleOrDefaultAsync();

            if (comment == null)
            {
                serviceResponse.Update("Comment does not exist", 404);
                return serviceResponse;
            }

            commentDto = TrimDtoStringPropsUtil.TrimDtoStringProps(commentDto);
            comment.Message = commentDto.Message;
            comment.LastModifiedOn = DateTimeOffset.UtcNow;
            comment.IsEdited = true;

            UnitOfWork.TicketCommentRepo.Update(comment);

            if (!await TrySaveAsync("updating comment"))
                return serviceResponse;

            serviceResponse.Update("Comment updated successfully", 200, comment.Adapt<TicketCommentDto>());
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error updating comment");
        }

        return serviceResponse;
    }

    // Deletes an existing comment on a ticket.
    public virtual async Task<ServiceResponse<bool>> DeleteCommentAsync(Guid commentId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete comment. Please try again", 400);

        try
        {
            // Users can only delete their own comments.
            var comment = await UnitOfWork.TicketCommentRepo
                .GetByConditionAsync(w => w.Id == commentId && w.CreatedByUserId == UserId)
                .SingleOrDefaultAsync();

            if (comment == null)
            {
                serviceResponse.Update("Comment does not exist", 404);
                return serviceResponse;
            }

            UnitOfWork.TicketCommentRepo.Delete(comment);

            if (!await TrySaveAsync("deleting comment"))
                return serviceResponse;

            serviceResponse.Update("Comment deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error deleting comment");
        }

        return serviceResponse;
    }

    // Retrieves list of attachments for a ticket.
    public virtual async Task<ServiceResponse<IEnumerable<TicketAttachmentDto>>> GetAttachmentsAsync(Guid ticketId)
    {
        var serviceResponse = ServiceResponse<IEnumerable<TicketAttachmentDto>>.Create("Failed to retrieve attachments. Please try again", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(ticketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            var attachments = await UnitOfWork.TicketAttachmentRepo
                .GetByConditionAsync(w => w.TicketId == ticketId)
                .ProjectToType<TicketAttachmentDto>()
                .ToListAsync();

            serviceResponse.Update("Attachments retrieved successfully", 200, attachments);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error retrieving attachments for ticket {Id}", ticketId);
        }

        return serviceResponse;
    }

    // Inserts a new attachment on a ticket.
    public virtual async Task<ServiceResponse<TicketAttachmentDto>> CreateAttachmentAsync(TicketAttachmentDto attachmentDto)
    {
        var serviceResponse = ServiceResponse<TicketAttachmentDto>.Create("Failed to add attachment. Please try again", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(attachmentDto.TicketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            // Closed tickets are read-only: no new attachments can be added.
            if (ticket.Status == TicketStatusEnum.Closed)
            {
                serviceResponse.Update("Cannot add attachments to a closed ticket", 400);
                return serviceResponse;
            }

            attachmentDto = TrimDtoStringPropsUtil.TrimDtoStringProps(attachmentDto);

            var newAttachment = attachmentDto.Adapt<TicketAttachment>();
            newAttachment.UploadedByUserId = UserId;

            await UnitOfWork.TicketAttachmentRepo.InsertAsync(newAttachment);

            if (!await TrySaveAsync("inserting attachment"))
                return serviceResponse;

            serviceResponse.Update("Attachment added successfully", 200, newAttachment.Adapt<TicketAttachmentDto>());
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error creating attachment");
        }

        return serviceResponse;
    }

    // Deletes an existing attachment on a ticket.
    public virtual async Task<ServiceResponse<bool>> DeleteAttachmentAsync(Guid attachmentId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete attachment. Please try again", 400);

        try
        {
            var attachment = await UnitOfWork.TicketAttachmentRepo
                .GetByConditionAsync(w => w.Id == attachmentId)
                .SingleOrDefaultAsync();

            if (attachment == null)
            {
                serviceResponse.Update("Attachment does not exist", 404);
                return serviceResponse;
            }

            // Best-effort delete of the underlying blob; the DB row is removed regardless.
            if (!string.IsNullOrWhiteSpace(attachment.FilePath))
            {
                var blobDeleteResponse = await UploadFileService.DeleteFileAsync(attachment.FilePath);
                if (blobDeleteResponse.StatusCode != 200)
                    Logger.LogWarning("Failed to delete blob '{FilePath}' for attachment {Id}: {Message}", attachment.FilePath, attachment.Id, blobDeleteResponse.Message);
            }

            UnitOfWork.TicketAttachmentRepo.Delete(attachment);

            if (!await TrySaveAsync("deleting attachment"))
                return serviceResponse;

            serviceResponse.Update("Attachment deleted successfully", 200, true);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error deleting attachment");
        }

        return serviceResponse;
    }

    // Retrieves the history of a ticket.
    public virtual async Task<ServiceResponse<IEnumerable<TicketHistoryDto>>> GetHistoryAsync(Guid ticketId)
    {
        var serviceResponse = ServiceResponse<IEnumerable<TicketHistoryDto>>.Create("Failed to retrieve history. Please try again", 400);

        try
        {
            var ticket = await GetScopedTicketAsync(ticketId);

            if (ticket == null)
            {
                serviceResponse.Update("Ticket does not exist", 404);
                return serviceResponse;
            }

            var history = await UnitOfWork.TicketHistoryRepo
                .GetByConditionAsync(w => w.TicketId == ticketId)
                .OrderByDescending(w => w.ChangedOn)
                .ProjectToType<TicketHistoryDto>()
                .ToListAsync();

            serviceResponse.Update("History retrieved successfully", 200, history);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error retrieving history for ticket {Id}", ticketId);
        }

        return serviceResponse;
    }
}
