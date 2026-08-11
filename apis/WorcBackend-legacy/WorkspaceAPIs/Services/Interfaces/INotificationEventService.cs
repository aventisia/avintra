namespace WorkspaceAPIs.Services;

/// <summary>
/// Centralized service that handles all automatic notification events.
/// Resolves recipients by role and delegates notification creation to
/// <see cref="IAutoNotificationService"/> to avoid duplicate logic.
/// </summary>
public interface INotificationEventService
{
    /// <summary>
    /// Notifies the Orchestrator Manager(s) of the agent's tenant that an agent
    /// has been published and is ready for use.
    /// </summary>
    Task NotifyAgentPublishedAsync(Guid tenantId, Guid agentId, string agentName);

    /// <summary>
    /// Notifies the Super Admin(s) and the ticket creator that a support ticket
    /// / change request was created.
    /// </summary>
    Task NotifyTicketCreatedAsync(Guid tenantId, Guid ticketId, string ticketNumber, string message, Guid creatorUserId);

    /// <summary>
    /// Notifies the Super Admin(s) and the ticket creator that a support ticket
    /// was updated.
    /// </summary>
    Task NotifyTicketUpdatedAsync(Guid tenantId, Guid ticketId, string ticketNumber, string message, Guid creatorUserId);

    /// <summary>
    /// Notifies the Super Admin(s) and the ticket creator that a comment was
    /// added to a support ticket.
    /// </summary>
    Task NotifyTicketCommentAsync(Guid tenantId, Guid ticketId, string ticketNumber, string message, Guid creatorUserId);

    /// <summary>
    /// Notifies the Tenant Admin(s) that the credit balance is low.
    /// </summary>
    Task NotifyLowCreditAsync(Guid tenantId, double availableCredits, double threshold);

    /// <summary>
    /// Notifies the Tenant Admin(s) of an upcoming subscription renewal.
    /// </summary>
    Task NotifySubscriptionRenewalAsync(Guid tenantId, DateTimeOffset nextBillingDate);
}
