namespace AccountsAPIs.Extensions;

public static class AppServicesExtension
{
    /// <summary>
    /// Adds db context services
    /// </summary>
    public static void AddDbContextConfig(this IServiceCollection services, IConfiguration config)
    {
        var connConfig = Guard.Against.Null(config.GetSection("ConnectionStringConfig").Get<ConnectionStringConfig>(), "ConnectionStringConfig cannot be null");
        var appDbConnectionString = $"{connConfig.AppDb.Credentials}{connConfig.AppDb.Host}{connConfig.AppDb.Database}{connConfig.AppDb.Other}";
        var tenantDbConnectionString = $"{connConfig.TenantDb.Credentials}{connConfig.TenantDb.Host}{connConfig.TenantDb.Database}{connConfig.TenantDb.Other}";

        services.AddDbContext<AccountsDbContext>(options => options.UseNpgsql(appDbConnectionString));
        services.AddDbContext<TenantDbContext>(options => options.UseNpgsql(tenantDbConnectionString));
    }

    /// <summary>
    /// Adds MappingProfiles
    /// </summary>
    public static void AddMappingProfiles(this IServiceCollection services)
    {
        // Mapster mapping profiles
        var config = TypeAdapterConfig.GlobalSettings;
        config.Apply(new TenantsTableMappingProfile());
        config.Apply(new TenantAccountMappingProfile());
        config.Apply(new AccountUsersTableMappingProfile());
        config.Apply(new SessionLogMappingProfile());
        config.Apply(new AccountRoleMappingProfile());
        config.Apply(new PermissionMappingProfile());
        config.Apply(new PaymentMappingProfile());
        config.Apply(new BillingDetailMappingProfile());
        config.Apply(new RoleManagementMappingProfile());
        config.Apply(new TenantRoleManagementMappingProfile());
        config.Apply(new AuditLogMappingProfile());
        config.Apply(new ActiveSessionMappingProfile());
        config.Apply(new SpaceTableMappingProfile());
        config.Apply(new AppIntegrationMappingProfile());
        config.Apply(new SubscriptionPlanMappingProfile());
        config.Apply(new TenantSubscriptionMappingProfile());
        config.Apply(new CreditPlanMappingProfile());
        config.Apply(new CreditUsageMappingProfile());
        services.AddSingleton(config);
    }

    /// <summary>
    /// Adds Identity configuration
    /// </summary>
    public static void AddIdentityConfig(
        this IServiceCollection services,
        IConfiguration config)
    {
        var identityConfig = Guard.Against.Null(config.GetSection("IdentityConfig").Get<IdentityConfig>(), "IdentityConfig cannot be null");

        var builder = services.AddIdentity<AccountUser, AccountRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 8;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Lockout.AllowedForNewUsers = true;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(identityConfig.DefaultLockoutTimeSpanInMinutes);
            options.Lockout.MaxFailedAccessAttempts = identityConfig.LockoutMaxFailedAccessAttempts;
            options.SignIn.RequireConfirmedAccount = identityConfig.SignInRequireConfirmedAccount;
            options.SignIn.RequireConfirmedEmail = identityConfig.SignInRequireConfirmedEmail;
            options.SignIn.RequireConfirmedPhoneNumber = identityConfig.SignInRequireConfirmedPhoneNo;
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<AccountsDbContext>()
        .AddDefaultTokenProviders();
    }

    /// <summary>
    /// Adds app dependencies like appsettings.json config and Services
    /// </summary>
    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {
        // Signleton
        services.AddSingleton(Guard.Against.Null(config.GetSection("SmtpConfig").Get<SmtpConfig>(), "SmtpConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("TenantDefaultConfig").Get<TenantDefaultConfig>(), "TenantDefaultConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("DefaultUsersConfig").Get<DefaultUsersConfig>(), "DefaultUsersConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("IdentityConfig").Get<IdentityConfig>(), "IdentityConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("VerificationCodeConfig").Get<VerificationCodeConfig>(), "VerificationCodeConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("ExternalAPIsConfig").Get<ExternalAPIsConfig>(), "ExternalAPIsConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("DefaultTenantConfig").Get<DefaultTenantConfig>(), message: "DefaultTenantConfig cannot be null"));

        // Feature services
        services.AddScoped<ICreateAccountService, CreateAccountService>();
        services.AddScoped<IUserRegistrationService, UserRegistrationService>();
        services.AddScoped<IVerificationCodeService, VerificationCodeService>();
        services.AddScoped<IContactUsService, ContactUsService>();
        services.AddScoped<IResetPwdService, ResetPwdService>();
        services.AddScoped<ILoginWithPwdService, LoginWithPwdService>();
        services.AddScoped<ISingleSignOnService, SingleSignOnService>();
        services.AddScoped<IMyAccountService, MyAccountService>();
        services.AddScoped<ITenantAccountService, TenantAccountService>();
        services.AddScoped<ITenantsTableService, TenantsTableService>();
        services.AddScoped<IAccountUsersTableService, AccountUsersTableService>();
        services.AddScoped<IAccountRoleService, AccountRoleService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<IBillingDetailService, BillingDetailService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IRoleManagementService, RoleManagementService>();
        services.AddScoped<ITenantRoleManagementService, TenantRoleManagementService>();
        services.AddScoped<ISpaceTableService, SpaceTableService>();
        services.AddScoped<IAppIntegrationService, AppIntegrationService>();
        services.AddScoped<ISubscriptionPlanService, SubscriptionPlanService>();
        services.AddScoped<ITenantSubscriptionService, TenantSubscriptionService>();
        services.AddScoped<ICreditPlanService, CreditPlanService>();
        services.AddScoped<ICreditUsageService, CreditUsageService>();

        // Register Razorpay related services for customer, plan, and subscription management
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IPlanService, PlanService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();

        // Common Services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAuthHelperService, AuthHelperService>();
        services.AddScoped<IAuthService, AuthService>();
    }

    /// <summary>
    /// Registers the Razorpay client and configuration in the dependency injection container.
    /// </summary>
    /// <param name="services">The collection of services to register.</param>
    /// <param name="config">The configuration provider used to retrieve Razorpay settings.</param>
    public static void AddRazorpayClient(this IServiceCollection services, IConfiguration config)
    {
        // Retrieve and validate the Razorpay configuration settings
        var razorpayConfig = Guard.Against.Null(config.GetSection("RazorpayConfig").Get<RazorpayConfig>(), "RazorpayConfig cannot be null");

        if (razorpayConfig == null || string.IsNullOrEmpty(razorpayConfig.KeyId) || string.IsNullOrEmpty(razorpayConfig.KeySecret))
        {
            throw new InvalidOperationException("Razorpay KeyId and KeySecret must be configured.");
        }

        // Register the Razorpay client as a singleton service
        services.AddSingleton<Razorpay.Api.RazorpayClient>(provider =>
            new Razorpay.Api.RazorpayClient(razorpayConfig.KeyId, razorpayConfig.KeySecret));

        // Optionally, register RazorpayConfig itself for further use
        services.AddSingleton(razorpayConfig);
    }
}