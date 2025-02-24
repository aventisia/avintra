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
    public DbSet<Plan> Plans { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<BillingAccount> BillingAccounts { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Address> Addresses { get; set; }
}