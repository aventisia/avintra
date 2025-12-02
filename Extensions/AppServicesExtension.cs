using WorkspaceAPIs.Features.CloudConnectors.M365.SendGrid;

namespace WorkspaceAPIs.Extensions;

public static class AppServicesExtension
{
    public static void AddDbContextConfig(this IServiceCollection services, IConfiguration config)
    {
        var connConfig = Guard.Against.Null(config.GetSection("ConnectionStringConfig").Get<ConnectionStringConfig>(), "ConnectionStringConfig cannot be null");
        var appDbConnectionString = $"{connConfig.AppDb.Credentials}{connConfig.AppDb.Host}{connConfig.AppDb.Database}{connConfig.AppDb.Other}";
        var tenantDbConnectionString = $"{connConfig.TenantDb.Credentials}{connConfig.TenantDb.Host}{connConfig.TenantDb.Database}{connConfig.TenantDb.Other}";

        services.AddDbContext<WorkspaceDbContext>(options => options.UseNpgsql(appDbConnectionString));
        services.AddDbContext<WorkspaceInternalDbContext>(options => options.UseNpgsql(appDbConnectionString));
        services.AddDbContext<TenantDbContext>(options => options.UseNpgsql(tenantDbConnectionString));
    }

    public static void AddMappingProfiles(this IServiceCollection services)
    {
        // Mapster mapping profiles
        var config = TypeAdapterConfig.GlobalSettings;
        config.Apply(new WorkspaceUserMappingProfile());
        config.Apply(new GlobalNotificationMappingProfile());
        config.Apply(new UnreadNotificationMappingProfile());
        config.Apply(new AutoNotificationMappingProfile());
        config.Apply(new FlowsTableMappingProfile());
        config.Apply(new FlowCommentMappingProfile());
        config.Apply(new FlowBuilderMappingProfile());
        config.Apply(new SupportTicketsTableMappingProfile());
        config.Apply(new SupportTicketRemarksMappingProfile());
        config.Apply(new FlowLogMappingProfile());
        config.Apply(new ProjectTemplateMappingProfile());
        config.Apply(new FlowVersionMappingProfile());
        config.Apply(new SubscriptionMappingProfile());
        config.Apply(new FlowExecutionLogMappingProfile());
        config.Apply(new ActionExecutionLogMappingProfile());
        config.Apply(new MachinesMappingProfile());
        config.Apply(new MachineFlowMappingProfile());
        config.Apply(new AgentTableMappingProfile());
        config.Apply(new QueueTableMappingProfile());
        config.Apply(new QueueTransactionMappingProfile());
        config.Apply(new JobTableMappingProfile());
        config.Apply(new KeyStoreMappingProfile());
        config.Apply(new VaultMappingProfile());
        config.Apply(new FlowUserMappingProfile());
        config.Apply(new BlockMappingProfile());
        config.Apply(new AppSecretMappingProfile());
        config.Apply(new TimeTriggerMappingProfile());

        services.AddSingleton(config);
    }

    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {

        // Signleton
        services.AddSingleton(Guard.Against.Null(config.GetSection("SmtpConfig").Get<SmtpConfig>(), "SmtpConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("AesEncryptionConfig").Get<AesEncryptionConfig>(), "AesEncryptionConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("DefaultTenantConfig").Get<DefaultTenantConfig>(), message: "DefaultTenantConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("APIKeyConfig").Get<APIKeyConfig>(), "APIKeyConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("ExtractViaLLMConfig").Get<ExtractViaLLMConfig>(), "ExtractViaLLMConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("OpenAIConfig").Get<OpenAIConfig>(), "OpenAIConfig cannot be null"));

        // Feature Services
        services.AddScoped<IWorkspaceUserService, WorkspaceUserService>();
        services.AddScoped<INotificationHelperService, NotificationHelperService>();
        services.AddScoped<IGlobalNotificationService, GlobalNotificationService>();
        services.AddScoped<IUnreadNotificationService, UnreadNotificationService>();
        services.AddScoped<IAutoNotificationService, AutoNotificationService>();
        services.AddScoped<IFlowsTableService, FlowsTableService>();
        services.AddScoped<IFlowCommentService, FlowCommentService>();
        services.AddScoped<IFlowBuilderService, FlowBuilderService>();
        services.AddScoped<ISupportTicketsTableService, SupportTicketsTableService>();
        services.AddScoped<ISupportTicketRemarksService, SupportTicketRemarksService>();
        services.AddScoped<IFlowLogService, FlowLogService>();
        services.AddScoped<IProjectTemplateService, ProjectTemplateService>();
        services.AddScoped<IPublicTemplateService, PublicTemplateService>();
        services.AddScoped<IFlowVersionService, FlowVersionService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IFlowExecutionLogService, FlowExecutionLogService>();
        services.AddScoped<IActionExecutionLogService, ActionExecutionLogService>();
        services.AddScoped<IMachineService, MachineService>();
        services.AddScoped<IMachineFlowService, MachineFlowService>();
        services.AddScoped<IAgentTableService, AgentTableService>();
        services.AddScoped<IQueueTableService, QueueTableService>();
        services.AddScoped<IQueueTransactionService, QueueTransactionService>();
        services.AddScoped<IJobTableService, JobTableService>();
        services.AddScoped<IKeyStoreService, KeyStoreService>();
        services.AddScoped<IVaultService, VaultService>();
        services.AddScoped<ITimeTriggerService, TimeTriggerService>();
        services.AddScoped<IFileUploadService, FileUploadService>();
        services.AddScoped<IFlowUserService, FlowUserService>();
        services.AddScoped<IBlockService, BlockService>();
        services.AddScoped<IAppSecretService, AppSecretService>();
        services.AddSingleton<IClientStatusStore, ClientStatusStore>();
        services.AddSingleton<IJobsExecutorService, JobsExecutorService>();

        // Cloud Connectors feature
        services.AddScoped<ICloudConnectorsVaultService, CloudConnectorsVaultService>();
        services.AddScoped<IM365ConnectorsService, M365ConnectorsService>();
        services.AddScoped<IM365ExcelConnectorsService, M365ExcelConnectorsService>();
        services.AddScoped<ISendGridConnectorsService, SendGridConnectorsService>();
        
        // Common services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
    }

    // Extension method to configure and register SignalR services.
    public static void AddSignalRConfig(this IServiceCollection services)
    {
        services.AddSignalR();

        // Register SignalR services with optional configuration
        services.AddSignalR(options =>
        {
            // Enables detailed error messages for debugging purposes (should be disabled in production for security)
            options.EnableDetailedErrors = true;

            // Optional: Set maximum size for received messages in bytes (uncomment and adjust if needed)
            // options.MaximumReceiveMessageSize = 102_400; // 100 KB
        });
    }
    // Method to configure and register Quartz jobs along with their triggers
    public static void AddQuartzJobs(this IServiceCollection services)
    {
        services.AddQuartz(quartz =>
        {
            // TimeTriggerExecutionJob configuration
            var timeTriggerExecutionJobKey = new JobKey("TimeTriggerExecutionJob");
            quartz.AddJob<TimeTriggerExecutionJob>(opts => opts.WithIdentity(timeTriggerExecutionJobKey));

            quartz.AddTrigger(opts => opts
                .ForJob(timeTriggerExecutionJobKey)
                .WithIdentity("TimeTriggerExecutionJob-trigger")
                .StartNow()
                .WithSimpleSchedule(x => x
                    .WithIntervalInMinutes(1)
                    .RepeatForever()));

            // TenantHistoryCleanupJob configuration
            var tenantHistoryCleanupJobKey = new JobKey("TenantHistoryCleanupJob");
            quartz.AddJob<TenantHistoryCleanupJob>(opts => opts.WithIdentity(tenantHistoryCleanupJobKey));

            quartz.AddTrigger(opts => opts
                .ForJob(tenantHistoryCleanupJobKey)
                .WithIdentity("TenantHistoryCleanupJob-trigger")
                .StartNow()
                .WithCronSchedule("0 0 2 * * ? *", x => x.InTimeZone(TimeZoneInfo.Utc)) // Runs daily at 2:00 AM UTC
                .WithDescription("Trigger for Tenant History Cleanup Job - Runs at 2:00 AM UTC daily"));
        });

        // Register Quartz hosted service to ensure jobs run in the background
        services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

        // Register the jobs with the DI container so they can be injected
        services.AddTransient<TimeTriggerExecutionJob>();
        services.AddTransient<TenantHistoryCleanupJob>();
    }
}