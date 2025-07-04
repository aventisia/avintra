namespace WorkspaceAPIs.Extensions;

public static class AppServicesExtension
{
    public static void AddDbContextConfig(this IServiceCollection services, IConfiguration config)
    {
        var connConfig = Guard.Against.Null(config.GetSection("ConnectionStringConfig").Get<ConnectionStringConfig>(), "ConnectionStringConfig cannot be null");
        var appDbConnectionString = $"{connConfig.AppDb.Credentials}{connConfig.AppDb.Host}{connConfig.AppDb.Database}{connConfig.AppDb.Other}";
        var tenantDbConnectionString = $"{connConfig.TenantDb.Credentials}{connConfig.TenantDb.Host}{connConfig.TenantDb.Database}{connConfig.TenantDb.Other}";

        services.AddDbContext<WorkspaceDbContext>(options => options.UseNpgsql(appDbConnectionString));
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

        config.Apply(new FlowTemplateMappingProfile());
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

        services.AddSingleton(config);
    }

    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {

        // Signleton
        services.AddSingleton(Guard.Against.Null(config.GetSection("SmtpConfig").Get<SmtpConfig>(), "SmtpConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("AesEncryptionConfig").Get<AesEncryptionConfig>(), "AesEncryptionConfig cannot be null"));

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
        services.AddScoped<IFlowTemplateService, FlowTemplateService>();
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
        services.AddScoped<ITriggerService, TriggerService>();
        services.AddScoped<IFileUploadService, FileUploadService>();
        services.AddScoped<IFlowUserService, FlowUserService>();
        services.AddScoped<IBlockService, BlockService>();

        // Common services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
    }
}