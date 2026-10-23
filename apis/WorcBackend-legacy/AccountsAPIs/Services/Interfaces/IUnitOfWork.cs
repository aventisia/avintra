namespace AccountsAPIs.Services;

public interface IUnitOfWork
{
    IAccountUserRepo AccountUserRepo { get; }

    ITenantRepo TenantRepo { get; }

    IActiveSessionRepo ActiveSessionRepo { get; }

    ISessionLogRepo SessionLogRepo { get; }

    IObsoletePwdRepo ObsoletePwdRepo { get; }

    IVerificationCodeRepo VerificationCodeRepo { get; }

    IContactUsRepo ContactUsRepo { get; }

    IEmailCampaignRepo EmailCampaignRepo { get; }

    IPermissionRepo PermissionRepo { get; }

    IAccountRoleRepo AccountRoleRepo { get; }

    IRolePermissionRepo RolePermissionRepo { get; }

    IAuditLogRepo AuditLogRepo { get; }

    IPaymentHistoryRepo PaymentHistoryRepo { get; }

    IPaymentMethodRepo PaymentMethodRepo { get; }

    IBillingDetailRepo BillingDetailRepo { get; }

    IBillingHistoryRepo BillingHistoryRepo { get; }

    ISpaceRepo SpaceRepo { get; }

    ISpaceUserRepo SpaceUserRepo { get; }

    IAppIntegrationRepo AppIntegrationRepo { get; }

    ISubscriptionPlanRepo SubscriptionPlanRepo { get; }

    ITenantSubscriptionRepo TenantSubscriptionRepo { get; }

    ITenantCreditRepo TenantCreditRepo { get; }

    ICreditPlanRepo CreditPlanRepo { get; }

    ICreditUsageRepo CreditUsageRepo { get; }

    IByokUsageRepo ByokUsageRepo { get; }

    IAITaskRepo AITaskRepo { get; }

    /// <summary>
    /// Saves the changes made in the unit of work asynchronously.
    /// </summary>
    /// <param name="checkHasChanges">Optional. Specifies whether to check if there are any changes before saving. Default is false.</param>
    /// <returns>A task representing the asynchronous save operation. The task result is a boolean indicating whether the save operation was successful.</returns>
    Task<bool> SaveAsync(bool checkHasChanges = false);

    /// <summary>
    /// Checks if there are any pending changes in the unit of work.
    /// </summary>
    /// <returns>True if there are pending changes, otherwise false.</returns>
    bool HasChanges();

    /// <summary>
    /// Runs the supplied operation inside a single database transaction. The transaction is
    /// committed when the operation completes and rolled back when it throws, so callers get
    /// all-or-nothing semantics across multiple repository saves.
    /// </summary>
    /// <param name="operation">The asynchronous work to execute atomically.</param>
    Task ExecuteInTransactionAsync(Func<Task> operation);

    /// <summary>
    /// Acquires a transaction-scoped PostgreSQL advisory lock for a logical resource key.
    /// </summary>
    Task AcquireAdvisoryLockAsync(string resourceKey);
}