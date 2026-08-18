namespace AccountsAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly AccountsDbContext _accountsDbContext;
    public UnitOfWork(
        AccountsDbContext accountsDbContext)
    {
        _accountsDbContext = accountsDbContext;
    }

    public IAccountUserRepo AccountUserRepo => new AccountUserRepo(_accountsDbContext);
    public ITenantRepo TenantRepo => new TenantRepo(_accountsDbContext);
    public IActiveSessionRepo ActiveSessionRepo => new ActiveSessionRepo(_accountsDbContext);
    public ISessionLogRepo SessionLogRepo => new SessionLogRepo(_accountsDbContext);
    public IObsoletePwdRepo ObsoletePwdRepo => new ObsoletePwdRepo(_accountsDbContext);
    public IVerificationCodeRepo VerificationCodeRepo => new VerificationCodeRepo(_accountsDbContext);
    public IContactUsRepo ContactUsRepo => new ContactUsRepo(_accountsDbContext);
    public IEmailCampaignRepo EmailCampaignRepo => new EmailCampaignRepo(_accountsDbContext);
    public IAccountRoleRepo AccountRoleRepo => new AccountRoleRepo(_accountsDbContext);
    public IPermissionRepo PermissionRepo => new PermissionRepo(_accountsDbContext);
    public IRolePermissionRepo RolePermissionRepo => new RolePermissionRepo(_accountsDbContext);
    public IPaymentHistoryRepo PaymentHistoryRepo => new PaymentHistoryRepo(_accountsDbContext);
    public IPaymentMethodRepo PaymentMethodRepo => new PaymentMethodRepo(_accountsDbContext);
    public IAuditLogRepo AuditLogRepo => new AuditLogRepo(_accountsDbContext);
    public IBillingDetailRepo BillingDetailRepo => new BillingDetailRepo(_accountsDbContext);
    public IBillingHistoryRepo BillingHistoryRepo => new BillingHistoryRepo(_accountsDbContext);
    public ISpaceRepo SpaceRepo => new SpaceRepo(_accountsDbContext);
    public ISpaceUserRepo SpaceUserRepo => new SpaceUserRepo(_accountsDbContext);
    public IAppIntegrationRepo AppIntegrationRepo => new AppIntegrationRepo(_accountsDbContext);
    public ISubscriptionPlanRepo SubscriptionPlanRepo => new SubscriptionPlanRepo(_accountsDbContext);
    public ITenantSubscriptionRepo TenantSubscriptionRepo => new TenantSubscriptionRepo(_accountsDbContext);
    public ITenantCreditRepo TenantCreditRepo => new TenantCreditRepo(_accountsDbContext);
    public ICreditPlanRepo CreditPlanRepo => new CreditPlanRepo(_accountsDbContext);
    public ICreditUsageRepo CreditUsageRepo => new CreditUsageRepo(_accountsDbContext);
    public IByokUsageRepo ByokUsageRepo => new ByokUsageRepo(_accountsDbContext);
    public IAITaskRepo AITaskRepo => new AITaskRepo(_accountsDbContext);

    public async Task<bool> SaveAsync(bool checkHasChanges = false) => checkHasChanges && (!_accountsDbContext.ChangeTracker.HasChanges() || await _accountsDbContext.SaveChangesAsync() > 0) || await _accountsDbContext.SaveChangesAsync() > 0;

    public bool HasChanges() => _accountsDbContext.ChangeTracker.HasChanges();
}