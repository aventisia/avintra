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
        config.Apply(new PaymentHistoryMappingProfile());
        config.Apply(new PaymentMethodMappingProfile());
        config.Apply(new BillingHistoryMappingProfile());
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
        config.Apply(new AITaskMappingProfile());
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
        services.AddSingleton(Guard.Against.Null(config.GetSection("InstanceConfig").Get<InstanceConfig>(), message: "InstanceConfig cannot be null"));

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
        services.AddScoped<IBillingHistoryService, BillingHistoryService>();
        services.AddScoped<IPaymentHistoryService, PaymentHistoryService>();
        services.AddScoped<IPaymentMethodService, PaymentMethodService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IRoleManagementService, RoleManagementService>();
        services.AddScoped<ITenantRoleManagementService, TenantRoleManagementService>();
        services.AddScoped<ISpaceTableService, SpaceTableService>();
        services.AddScoped<IAppIntegrationService, AppIntegrationService>();
        services.AddScoped<ISubscriptionPlanService, SubscriptionPlanService>();
        services.AddScoped<ITenantSubscriptionService, TenantSubscriptionService>();
        services.AddScoped<ICreditPlanService, CreditPlanService>();
        services.AddScoped<ICreditUsageService, CreditUsageService>();
        services.AddScoped<ITopUpService, TopUpService>();
        services.AddScoped<IPaymentTrackerService, PaymentTrackerService>();
        services.AddScoped<IAITaskService, AITaskService>();
        services.AddScoped<IInstanceService, InstanceService>();

        // Register AppRuntimeSettings as a singleton so that a single instance is shared across the application
        services.AddSingleton<AppRuntimeSettings>();

        // Register Razorpay related services for customer, plan, and subscription management
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IPlanService, PlanService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IWebhookService, WebhookService>();

        // Common Services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAuthHelperService, AuthHelperService>();
        services.AddScoped<IAuthService, AuthService>();

        // Register your hosted service
        services.AddHostedService<InstanceUsageStartupService>();
    }

    /// <summary>
    /// Registers the Razorpay client and configuration in the dependency injection container.
    /// </summary>
    /// <param name="services">The collection of services to register.</param>
    /// <param name="config">The configuration provider used to retrieve Razorpay settings.</param>
    /// <param name="tenantType">The tenant type (e.g., Commercial, Enterprise) to determine if Razorpay should be enabled.</param>
    public static void AddRazorpayClient(this IServiceCollection services, IConfiguration config, OnPremTenantTypesEnum tenantType)
    {
        // Check if the tenant type is Commercial, as Razorpay integration is only needed for Commercial tenants
        if (tenantType == OnPremTenantTypesEnum.Commercial)
        {
            // Retrieve the Razorpay configuration section from the configuration provider
            var razorpayConfig = Guard.Against.Null(config.GetSection("RazorpayConfig").Get<RazorpayConfig>(), "RazorpayConfig cannot be null");

            // Check if Razorpay KeyId and KeySecret are configured correctly
            if (razorpayConfig == null || string.IsNullOrEmpty(razorpayConfig.KeyId) || string.IsNullOrEmpty(razorpayConfig.KeySecret))
            {
                throw new InvalidOperationException("Razorpay KeyId and KeySecret must be configured.");
            }

            services.AddSingleton<Razorpay.Api.RazorpayClient>(provider =>
                new Razorpay.Api.RazorpayClient(razorpayConfig.KeyId, razorpayConfig.KeySecret));

            services.AddSingleton(razorpayConfig);
        }
        // If the tenant type is not Commercial, Razorpay integration is skipped (no further action is needed here)
    }

    // Extension method to configure and register Quartz jobs and their triggers
    public static void AddQuartzJobs(this IServiceCollection services)
    {
        // Configure Quartz scheduler
        services.AddQuartz(quartz =>
        {
            // -----------------------------
            // TenantCreditAllocationJob
            // -----------------------------
            // Define a unique JobKey for the job
            var tenantCreditAllocationJobKey = new JobKey("TenantCreditAllocationJob");

            // Register the TenantCreditAllocationJob with Quartz
            quartz.AddJob<TenantCreditAllocationJob>(opts => opts.WithIdentity(tenantCreditAllocationJobKey));

            // Define a trigger for the job to run daily at 12:00 AM UTC
            quartz.AddTrigger(opts => opts
                .ForJob(tenantCreditAllocationJobKey)
                .WithIdentity("TenantCreditAllocationJob-trigger")
                .StartNow()
                .WithCronSchedule("0 0 0 * * ? *", x => x.InTimeZone(TimeZoneInfo.Utc)) // Cron expression: daily at 12:00 AM UTC
                .WithDescription("Trigger for Tenant Credit Allocation Job - runs daily at 12:00 AM UTC"));

            // -----------------------------
            // InstanceUsageJob
            // -----------------------------
            var instanceUsageJobKey = new JobKey("InstanceUsageJob");

            // Register the InstanceUsageJob with Quartz
            quartz.AddJob<InstanceUsageJob>(opts => opts.WithIdentity(instanceUsageJobKey));

            // Define a trigger for the job to run daily at 12:01 AM UTC
            quartz.AddTrigger(opts => opts
                .ForJob(instanceUsageJobKey)
                .WithIdentity("InstanceUsageJob-trigger")
                .StartNow()
                .WithCronSchedule("1 0 0 * * ? *", x => x.InTimeZone(TimeZoneInfo.Utc)) // Cron expression: daily at 12:01 AM UTC
                .WithDescription("Trigger for Instance Usage Job - runs daily at 12:01 AM UTC"));
        });

        // Register Quartz hosted service to run jobs in the background and wait for job completion on shutdown
        services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

        // Register job classes with DI container so they can receive dependencies via constructor injection
        services.AddTransient<TenantCreditAllocationJob>();
        services.AddTransient<InstanceUsageJob>();
    }
}