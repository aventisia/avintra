namespace AccountsAPIs.Data;

public partial class AccountsDbContext
{
    public override DbSet<AccountRole> Roles { get; set; }
    public override DbSet<AccountUser> Users { get; set; }
    public override DbSet<AccountUserRole> UserRoles { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<ActiveSession> ActiveSessions { get; set; }
    public DbSet<SessionLog> SessionLogs { get; set; }
    public DbSet<ObsoletePwd> ObsoletePwds { get; set; }
    public DbSet<VerificationCode> VerificationCodes { get; set; }
    public DbSet<ContactUs> ContactUs { get; set; }
    public DbSet<EmailCampaign> EmailCampaigns { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<BillingDetail> BillingDetails { get; set; }
    public DbSet<BillingHistory> BillingHistories { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Space> Spaces { get; set; }
    public DbSet<SpaceUser> SpaceUsers { get; set; }
    public DbSet<AppIntegration> AppIntegrations { get; set; }
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
    public DbSet<TenantSubscription> TenantSubscriptions { get; set; }
    public DbSet<TenantCredit> TenantCredits { get; set; }
    public DbSet<CreditPlan> CreditPlans { get; set; }
    public DbSet<CreditUsage> CreditUsages { get; set; }
    public DbSet<PaymentHistory> PaymentHistories { get; set; }
    public DbSet<PaymentMethod> PaymentMethods { get; set; }
    public DbSet<AITask> AITasks { get; set; }
}