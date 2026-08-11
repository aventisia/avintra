namespace WorkspaceAPIs.Services;

/// <summary>
/// Centralized implementation of <see cref="INotificationEventService"/>.
/// Resolves recipients by role via <see cref="INotificationRecipientResolver"/> and
/// delegates notification creation to <see cref="IAutoNotificationService"/>.
/// </summary>
public class NotificationEventService : INotificationEventService
{
    private readonly ILogger<NotificationEventService> _logger;
    private readonly IAutoNotificationService _autoNotificationService;
    private readonly INotificationRecipientResolver _recipientResolver;
    private readonly Guid _userId;

    public NotificationEventService(
        ILogger<NotificationEventService> logger,
        IAutoNotificationService autoNotificationService,
        INotificationRecipientResolver recipientResolver,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _autoNotificationService = autoNotificationService;
        _recipientResolver = recipientResolver;

        // Set _userId from the JWT "uid" claim (empty Guid when absent, e.g. background jobs)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    /// <inheritdoc />
    public async Task NotifyAgentPublishedAsync(Guid tenantId, Guid agentId, string agentName)
    {
        try
        {
            var omUserIds = await _recipientResolver.ResolveUserIdsByRoleNameAsync(CustomRolesEnum.OM.ToString(), tenantId);
            if (omUserIds.Count == 0)
            {
                _logger.LogInformation("No Orchestrator Manager found for tenant {TenantId} to notify on agent publish.", tenantId);
                return;
            }

            var dto = new AutoNotificationDto
            {
                RefId = agentId,
                Title = "Agent Published",
                Message = $"Agent \"{agentName}\" has been published and is ready for use.",
                Type = NotificationTypesEnum.Information,
                ActionUrl = $"/tenant/agents",
                SourceType = NotificationSourceEnum.AgentPublished,
                UserIdList = omUserIds
            };

            await _autoNotificationService.InsertAutoNotificationAsync(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify Orchestrator Manager(s) about published agent {AgentId}.", agentId);
        }
    }

    /// <inheritdoc />
    public async Task NotifyTicketCreatedAsync(Guid tenantId, Guid ticketId, string ticketNumber, string message, Guid creatorUserId)
    {
        await NotifyTicketEventAsync(tenantId, ticketId, ticketNumber, message, NotificationSourceEnum.NewTicket, NotificationTypesEnum.Information, creatorUserId);
    }

    /// <inheritdoc />
    public async Task NotifyTicketUpdatedAsync(Guid tenantId, Guid ticketId, string ticketNumber, string message, Guid creatorUserId)
    {
        await NotifyTicketEventAsync(tenantId, ticketId, ticketNumber, message, NotificationSourceEnum.TicketUpdate, NotificationTypesEnum.Information, creatorUserId);
    }

    /// <inheritdoc />
    public async Task NotifyTicketCommentAsync(Guid tenantId, Guid ticketId, string ticketNumber, string message, Guid creatorUserId)
    {
        await NotifyTicketEventAsync(tenantId, ticketId, ticketNumber, message, NotificationSourceEnum.TicketComment, NotificationTypesEnum.Information, creatorUserId);
    }

    /// <inheritdoc />
    public async Task NotifyLowCreditAsync(Guid tenantId, double availableCredits, double threshold)
    {
        try
        {
            var taUserIds = await _recipientResolver.ResolveUserIdsByRoleNameAsync(CustomRolesEnum.TA.ToString(), tenantId);
            if (taUserIds.Count == 0)
            {
                _logger.LogInformation("No Tenant Admin found for tenant {TenantId} to notify on low credit.", tenantId);
                return;
            }

            var dto = new AutoNotificationDto
            {
                RefId = tenantId,
                Title = "Low Credit Warning",
                Message = $"Your credit balance is low ({availableCredits:N0} credits remaining). Please top up to avoid service interruption.",
                Type = NotificationTypesEnum.Warning,
                ActionUrl = $"/tenant/credits",
                SourceType = NotificationSourceEnum.LowCredit,
                UserIdList = taUserIds
            };

            await _autoNotificationService.InsertAutoNotificationAsync(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify Tenant Admin(s) about low credit for tenant {TenantId}.", tenantId);
        }
    }

    /// <inheritdoc />
    public async Task NotifySubscriptionRenewalAsync(Guid tenantId, DateTimeOffset nextBillingDate)
    {
        try
        {
            var taUserIds = await _recipientResolver.ResolveUserIdsByRoleNameAsync(CustomRolesEnum.TA.ToString(), tenantId);
            if (taUserIds.Count == 0)
            {
                _logger.LogInformation("No Tenant Admin found for tenant {TenantId} to notify on subscription renewal.", tenantId);
                return;
            }

            var dto = new AutoNotificationDto
            {
                RefId = tenantId,
                Title = "Subscription Renewal Reminder",
                Message = $"Your subscription is due for renewal on {nextBillingDate:dd MMM yyyy}. Please ensure your payment method is up to date.",
                Type = NotificationTypesEnum.Reminder,
                ActionUrl = $"/tenant/billing",
                SourceType = NotificationSourceEnum.SubscriptionRenewal,
                UserIdList = taUserIds
            };

            await _autoNotificationService.InsertAutoNotificationAsync(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify Tenant Admin(s) about subscription renewal for tenant {TenantId}.", tenantId);
        }
    }

    /// <summary>
    /// Shared logic for support-ticket events: notifies the Super Admin(s) (global)
    /// and the ticket creator.
    /// </summary>
    private async Task NotifyTicketEventAsync(Guid tenantId, Guid ticketId, string ticketNumber, string message, NotificationSourceEnum sourceType, NotificationTypesEnum type, Guid creatorUserId)
    {
        try
        {
            var recipientUserIds = new List<Guid>();

            // Super Admin(s) are global (no tenant scope)
            var saUserIds = await _recipientResolver.ResolveUserIdsByRoleNameAsync(CustomRolesEnum.SA.ToString(), null);
            recipientUserIds.AddRange(saUserIds);

            // The ticket creator is always notified
            if (creatorUserId != Guid.Empty && !recipientUserIds.Contains(creatorUserId))
            {
                recipientUserIds.Add(creatorUserId);
            }

            if (recipientUserIds.Count == 0)
            {
                _logger.LogInformation("No recipients to notify for ticket {TicketId}.", ticketId);
                return;
            }

            var dto = new AutoNotificationDto
            {
                RefId = ticketId,
                Title = $"Ticket {ticketNumber}",
                Message = message,
                Type = type,
                ActionUrl = $"/tenant/support/ticket/details?id={ticketId}",
                SourceType = sourceType,
                UserIdList = recipientUserIds
            };

            await _autoNotificationService.InsertAutoNotificationAsync(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to notify recipients about ticket {TicketId}.", ticketId);
        }
    }
}
