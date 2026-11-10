namespace AccountsAPIs.Jobs;

public class PendingCheckoutCleanupJob : IJob
{
    private static readonly TimeSpan PendingCheckoutLifetime = TimeSpan.FromHours(24);

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PendingCheckoutCleanupJob> _logger;

    public PendingCheckoutCleanupJob(IUnitOfWork unitOfWork, ILogger<PendingCheckoutCleanupJob> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        var cutoff = DateTimeOffset.UtcNow.Subtract(PendingCheckoutLifetime);

        try
        {
            var failedPayments = await FailStalePaymentsAsync(cutoff);
            var cancelledSubscriptions = await CancelStaleUpgradeSubscriptionsAsync(cutoff);

            _logger.LogInformation(
                "Pending checkout cleanup finished: {FailedPayments} stale payments marked failed, {CancelledSubscriptions} stale upgrade subscriptions cancelled.",
                failedPayments,
                cancelledSubscriptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while clearing stale pending checkout rows.");
        }
    }

    private async Task<int> FailStalePaymentsAsync(DateTimeOffset cutoff)
    {
        var stalePayments = await _unitOfWork.BillingHistoryRepo
            .GetByConditionAsync(w =>
                w.PaymentStatus == PaymentStatusTypesEnum.Created &&
                w.CreatedOn <= cutoff)
            .ToListAsync();

        var failedPayments = 0;

        foreach (var payment in stalePayments)
        {
            payment.PaymentStatus = PaymentStatusTypesEnum.Failed;
            payment.LastModifiedOn = DateTimeOffset.UtcNow;
            _unitOfWork.BillingHistoryRepo.Update(payment);

            // IMPORTANT NOTE: the payment webhook can advance a row between this scan and the write; the row Version rejects the stale update and the webhook's state wins.
            try
            {
                await _unitOfWork.SaveAsync();
                failedPayments++;
            }
            catch (DbUpdateConcurrencyException)
            {
                _unitOfWork.BillingHistoryRepo.Detach(payment);
            }
        }

        return failedPayments;
    }

    private async Task<int> CancelStaleUpgradeSubscriptionsAsync(DateTimeOffset cutoff)
    {
        var staleSubscriptions = await _unitOfWork.TenantSubscriptionRepo
            .GetByConditionAsync(w =>
                w.Status == SubscriptionStatusTypesEnum.Initiated &&
                !w.IsActive &&
                w.CreatedOn <= cutoff &&
                w.Plan!.Type != SubscriptionPlanTypeEnum.Starter)
            .ToListAsync();

        if (staleSubscriptions.Count == 0) return 0;

        var tenantIds = staleSubscriptions.Select(w => w.TenantId).Distinct().ToList();
        var tenantsWithActiveSubscription = await _unitOfWork.TenantSubscriptionRepo
            .GetByConditionAsync(w => w.IsActive && tenantIds.Contains(w.TenantId))
            .Select(w => w.TenantId)
            .Distinct()
            .ToListAsync();
        var activeTenantIds = tenantsWithActiveSubscription.ToHashSet();

        var cancelledSubscriptions = 0;

        foreach (var subscription in staleSubscriptions)
        {
            if (!activeTenantIds.Contains(subscription.TenantId)) continue;

            subscription.Status = SubscriptionStatusTypesEnum.Cancelled;
            subscription.LastModifiedOn = DateTimeOffset.UtcNow;
            _unitOfWork.TenantSubscriptionRepo.Update(subscription);

            // IMPORTANT NOTE: the payment webhook can activate a row between this scan and the write; the row Version rejects the stale update and the activation wins.
            try
            {
                await _unitOfWork.SaveAsync();
                cancelledSubscriptions++;
            }
            catch (DbUpdateConcurrencyException)
            {
                _unitOfWork.TenantSubscriptionRepo.Detach(subscription);
            }
        }

        return cancelledSubscriptions;
    }
}
