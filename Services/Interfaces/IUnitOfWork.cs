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

    IPermissionRepo PermissionRepo { get; }

    IAccountRoleRepo AccountRoleRepo { get; }

    IRolePermissionRepo RolePermissionRepo { get; }

    IAuditLogRepo AuditLogRepo { get; }

    IPaymentRepo PaymentRepo { get; }

    IPricingPlanRepo PricingPlanRepo { get; }

    IBillingDetailRepo BillingDetailRepo { get; }

    ISpaceRepo SpaceRepo { get; }

    ISpaceUserRepo SpaceUserRepo { get; }

    IAppIntegrationRepo AppIntegrationRepo { get; }

    IAppSecretRepo AppSecretRepo { get; }

    ISubscriptionPlanRepo SubscriptionPlanRepo { get; }

    ITenantSubscriptionRepo TenantSubscriptionRepo { get; }

    ICreditPlanRepo CreditPlanRepo { get; }

    ICreditUsageRepo CreditUsageRepo { get; }

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
}