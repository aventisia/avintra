using WorkspaceAPIs.Features.CloudConnectors.Azure;
using WorkspaceAPIs.Features.CloudConnectors.Camel;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Helpers;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Services;
using WorkspaceAPIs.Features.CloudConnectors.Email;
using WorkspaceAPIs.Features.CloudConnectors.LLMProvider;
using WorkspaceAPIs.Features.CloudConnectors.M365.SharePoint;
using WorkspaceAPIs.Features.CloudConnectors.SendGrid;
using WorkspaceAPIs.Features.CloudConnectors.Twilio;
using WorkspaceAPIs.Features.CloudConnectors.VectorStore;
using WorkspaceAPIs.Features.CloudConnectors.VectorStore.PgVector;
using WorkspaceAPIs.Features.Chats.StreamingChat.Service;
using WorkspaceAPIs.Features.Corsair;

namespace WorkspaceAPIs.Extensions;

public static class AppServicesExtension
{
    public static void AddDbContextConfig(this IServiceCollection services, IConfiguration config)
    {
        var environmentConfig = Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), message: "EnvironmentConfig cannot be null");

        // Read PostgreSQL settings from environment variables or config
        var pgHost = environmentConfig.PostgresqlHost ?? "localhost";
        var pgPort = environmentConfig.PostgresqlPort.ToString() ?? "5432";
        var pgUsername = environmentConfig.PostgresqlUsername ?? "";
        var pgPassword = environmentConfig.PostgresqlPassword ?? "";

        // Build connection strings for different databases
        var appDbConnectionString = $"Host={pgHost};Port={pgPort};Username={pgUsername};Password={pgPassword};Database=WorkspaceDb;Include Error Detail=true";
        var tenantDbConnectionString = $"Host={pgHost};Port={pgPort};Username={pgUsername};Password={pgPassword};Database=AccountsDb;Include Error Detail=true";

        services.AddDbContext<WorkspaceDbContext>(options =>
            options.UseNpgsql(
                appDbConnectionString,
                npgsqlOptions => npgsqlOptions.UseVector()
            )
        );
        services.AddDbContext<WorkspaceInternalDbContext>(options => options.UseNpgsql(appDbConnectionString));
        services.AddDbContext<TenantDbContext>(options => options.UseNpgsql(tenantDbConnectionString));
    }

    public static void AddMappingProfiles(this IServiceCollection services)
    {
        // Mapster mapping profiles
        var config = TypeAdapterConfig.GlobalSettings;
        config.Apply(new WorkspaceUserMappingProfile());
        config.Apply(new GlobalNotificationMappingProfile());
        config.Apply(new NotificationMappingProfile());
        config.Apply(new SaNotificationMappingProfile());
        config.Apply(new UnreadNotificationMappingProfile());
        config.Apply(new AutoNotificationMappingProfile());
        config.Apply(new FlowsTableMappingProfile());
        config.Apply(new FlowBuilderMappingProfile());
        config.Apply(new SupportTicketsTableMappingProfile());
        config.Apply(new SupportTicketRemarksMappingProfile());
        config.Apply(new FlowLogMappingProfile());
        config.Apply(new ProjectTemplateMappingProfile());
        config.Apply(new FlowVersionMappingProfile());
        config.Apply(new FlowVersionHistoryMappingProfile());
        config.Apply(new MachinesTableMappingProfile());
        config.Apply(new MachineFlowMappingProfile());
        config.Apply(new AgentTableMappingProfile());
        config.Apply(new QueueTableMappingProfile());
        config.Apply(new QueueTransactionMappingProfile());
        config.Apply(new QueueTransactionEventMappingProfile());
        config.Apply(new QueueUserMappingProfile());
        config.Apply(new QueueFlowVersionMappingProfile());
        config.Apply(new JobsTableMappingProfile());
        config.Apply(new KeyStoreMappingProfile());
        config.Apply(new VaultMappingProfile());
        config.Apply(new FlowUserMappingProfile());
        config.Apply(new AppSecretMappingProfile());
        config.Apply(new TimeTriggerMappingProfile());
        config.Apply(new EmailTriggerMappingProfile());
        config.Apply(new MessageTriggerMappingProfile());
        config.Apply(new WebhookTriggerMappingProfile());
        config.Apply(new PromptTemplateMappingProfile());
        config.Apply(new OnPremModelMappingProfile());
        config.Apply(new QueueWorkItemMappingProfile());
        config.Apply(new FlowVersionUserMappingProfile());
        config.Apply(new AssistChatMappingProfile());
        config.Apply(new ConversationMappingProfile());
        config.Apply(new ConversationMessageMappingProfile());
        config.Apply(new AdminConversationMappingProfile());
        config.Apply(new SearchByQueryMappingProfile());
        config.Apply(new KnowledgeBaseMappingProfile());
        config.Apply(new KnowledgeBaseFileMappingProfile());
        config.Apply(new SkillMappingProfile());
        config.Apply(new JobExecutionLogMappingProfile());
        config.Apply(new ResourceShareMappingProfile());
        config.Apply(new ApiKeyMappingProfile());
        config.Apply(new ToolMappingProfile());
        config.Apply(new TicketMappingProfile());

        services.AddSingleton(config);
    }

    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {
        // Signleton
        services.AddSingleton(Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), "EnvironmentConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("AppDefaultConfig").Get<AppDefaultConfig>(), "AppDefaultConfig cannot be null"));

        // ExecuteFlow feature services
        services.AddScoped<IExecuteFlowStep1Service, ExecuteFlowStep1Service>();
        services.AddScoped<IExecutionNotificationService, ExecutionNotificationService>();
        services.AddScoped<IExecuteFlowStep2Service, ExecuteFlowStep2Service>();
        services.AddScoped<IExecutionGraphService, ExecutionGraphService>();

        // Client context resolution (User-Agent / client-type headers)
        services.AddScoped<IClientContextResolver, ClientContextResolver>();

        // Feature Services
        services.AddScoped<IWorkspaceUserService, WorkspaceUserService>();
        services.AddScoped<INotificationHelperService, NotificationHelperService>();
        services.AddScoped<IGlobalNotificationService, GlobalNotificationService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ISaNotificationService, SaNotificationService>();
        services.AddScoped<INotificationHistoryService, NotificationHistoryService>();
        services.AddScoped<IUnreadNotificationService, UnreadNotificationService>();
        services.AddScoped<IAutoNotificationService, AutoNotificationService>();
        services.AddScoped<INotificationEventService, NotificationEventService>();
        services.AddScoped<INotificationRecipientResolver, NotificationRecipientResolver>();
        services.AddScoped<IFlowsTableService, FlowsTableService>();
        services.AddScoped<IFlowBuilderService, FlowBuilderService>();
        services.AddScoped<ISupportTicketsTableService, SupportTicketsTableService>();
        services.AddScoped<ISupportTicketRemarksService, SupportTicketRemarksService>();
        services.AddScoped<IFlowLogService, FlowLogService>();
        services.AddScoped<IProjectTemplateService, ProjectTemplateService>();
        services.AddScoped<IPublicTemplateService, PublicTemplateService>();
        services.AddScoped<IFlowVersionService, FlowVersionService>();
        services.AddScoped<ISearchByQueryService, SearchByQueryService>();
        services.AddScoped<IFlowVersionHistoryService, FlowVersionHistoryService>();
        services.AddScoped<IAgentRiskRegistryService, AgentRiskRegistryService>();
        services.AddScoped<IMachinesTableService, MachinesTableService>();
        services.AddScoped<IMachineFlowService, MachineFlowService>();
        services.AddScoped<IAgentTableService, AgentTableService>();
        services.AddScoped<IQueueTableService, QueueTableService>();
        services.AddScoped<IQueueStatusService, QueueStatusService>();
        services.AddScoped<IQueueTransactionService, QueueTransactionService>();
        services.AddScoped<IQueueTransactionEventService, QueueTransactionEventService>();
        services.AddScoped<IQueueUserService, QueueUserService>();
        services.AddScoped<IQueueFlowVersionService, QueueFlowVersionService>();
        services.AddScoped<IJobsTableService, JobsTableService>();
        services.AddScoped<IKeyStoreService, KeyStoreService>();
        services.AddScoped<IVaultService, VaultService>();
        services.AddScoped<ITriggerApiKeyService, TriggerApiKeyService>();
        services.AddScoped<ITimeTriggerService, TimeTriggerService>();
        services.AddScoped<IEmailTriggerService, EmailTriggerService>();
        services.AddScoped<IMessageTriggerService, MessageTriggerService>();
        services.AddScoped<IWebhookTriggerService, WebhookTriggerService>();
        services.AddScoped<IWebhookCallbackService, WebhookCallbackService>();
        services.AddScoped<IFileUploadService, FileUploadService>();
        services.AddScoped<IFlowUserService, FlowUserService>();
        services.AddScoped<IAppSecretService, AppSecretService>();
        services.AddScoped<ICorsairSidecarService, CorsairSidecarService>();
        services.AddScoped<ICorsairInvokeService, CorsairInvokeService>();
        services.AddSingleton<CorsairConfigRepository>();
        services.AddSingleton<ConcurrentDictionary<Guid, ClientDataStore>>();
        services.AddSingleton<ConcurrentDictionary<string, Guid>>();
        services.AddSingleton<ConcurrentDictionary<Guid, int>>();
        services.AddScoped<IClientStatusStore, ClientStatusStore>();
        services.AddScoped<IJobsExecutorService, JobsExecutorService>();
        services.AddScoped<IPromptTemplateService, PromptTemplateService>();
        services.AddScoped<IProjectUsageService, ProjectUsageService>();
        services.AddScoped<IOnPremModelService, OnPremModelService>();
        services.AddScoped<ITenantModelProviderService, TenantModelProviderService>();
        services.AddScoped<ILLMProviderService, LLMProviderService>();
        services.AddScoped<IManageTenantService, ManageTenantService>();
        services.AddScoped<ISpaceSummaryService, SpaceSummaryService>();
        services.AddScoped<IQueueWorkItemService, QueueWorkItemService>();
        services.AddScoped<IAgentBuilderStore, AgentBuilderStore>();
        services.AddSingleton<ConcurrentDictionary<Guid, AgentBuilderModel>>();
        // Collaboration state (presence + locks) must be shared across requests and
        // SignalR connections, so it is registered as a singleton.
        services.AddSingleton<ICollaborationStore, CollaborationStore>();
        services.AddScoped<IFlowVersionUserService, FlowVersionUserService>();
        services.AddScoped<IAssistChatService, AssistChatService>();
        services.AddScoped<IConversationService, ConversationService>();
        services.AddScoped<IConversationMessageService, ConversationMessageService>();
        services.AddScoped<IStreamingChatService, StreamingChatService>();
        services.AddScoped<IAdminConversationService, AdminConversationService>();
        services.AddScoped<IKnowledgeBaseService, KnowledgeBaseService>();
        services.AddScoped<IKnowledgeBaseFileService, KnowledgeBaseFileService>();
        services.AddScoped<ISkillRegistryService, SkillRegistryService>();
        services.AddScoped<ISkillRegistryFileService, SkillRegistryFileService>();
        services.AddScoped<IJobExecutionLogService, JobExecutionLogService>();
        services.AddScoped<INodeExecutionLogService, NodeExecutionLogService>();
        services.AddScoped<IResourceShareService, ResourceShareService>();
        services.AddScoped<IApiKeyService, ApiKeyService>();
        services.AddScoped<IMachineAuthService, MachineAuthService>();
        services.AddScoped<IToolService, ToolService>();
        services.AddScoped<IFlowVersionToolService, FlowVersionToolService>();
        services.AddScoped<ITenantTicketService, TenantTicketService>();
        services.AddScoped<ISuperAdminTicketService, SuperAdminTicketService>();
        services.AddHostedService<BackfillNodeExecutionLogsHostedService>();

        // Cloud Connectors feature
        services.AddScoped<ICloudConnectorsVaultService, CloudConnectorsVaultService>();
        // Generic catalog-driven Camel connector service (all families): config
        // resolution, catalog client, unified seeding, startup seeding.
        services.AddSingleton<CamelConnectorsConfigRepository>();
        services.AddSingleton<CamelCatalogClient>();
        services.AddScoped<CamelConnectorService>();
        services.AddScoped<ICamelConnectorService, CamelConnectorService>();
        services.AddSingleton<CamelConnectorCatalogRepository>();
        services.AddSingleton<CorsairIntegrationCatalogRepository>();
        services.AddSingleton<CamelConfigPaths>();
        services.AddScoped<ICamelSeedingService, CamelSeedingService>();
        services.AddScoped<CamelMappingFilesGenerator>();
        //services.AddHostedService<CamelStartupHostedService>();
        services.AddScoped<IM365ConnectorsService, M365ConnectorsService>();
        services.AddScoped<IM365ExcelConnectorsService, M365ExcelConnectorsService>();
        services.AddScoped<ISendGridConnectorsService, SendGridConnectorsService>();
        services.AddScoped<ITwilioConnectorsService, TwilioConnectorsService>();
        services.AddScoped<ILLMProviderConnectorsService, LLMProviderConnectorsService>();
        services.AddScoped<IEmailConnectorsService, EmailConnectorsService>();
        services.AddScoped<IAzureConnectorsService, AzureConnectorsService>();
        services.AddScoped<IM365OutlookConnectorsService, M365OutlookConnectorsService>();
        services.AddScoped<IM365SharePointConnectorsService, M365SharePointConnectorsService>();
        services.AddScoped<IVectorConnectorsService, VectorConnectorsService>();

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
        })
        // Configure the JSON protocol so enums are serialized/deserialized as strings.
        // The frontend sends lock target types (e.g. "Node") and flow action types as
        // strings; without this, SignalR's default numeric enum binding throws
        // InvalidDataException on hub methods taking those DTOs.
        .AddJsonProtocol(options =>
        {
            options.PayloadSerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
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

            // ExecutionTimeoutMonitorJob configuration
            var executionTimeoutMonitorJobKey = new JobKey("ExecutionTimeoutMonitorJob");

            quartz.AddJob<ExecutionTimeoutMonitorJob>(opts =>
                opts.WithIdentity(executionTimeoutMonitorJobKey));

            quartz.AddTrigger(opts => opts
                .ForJob(executionTimeoutMonitorJobKey)
                .WithIdentity("ExecutionTimeoutMonitorJob-trigger")
                .StartNow()
                .WithSimpleSchedule(x => x
                    .WithIntervalInMinutes(5)
                    .RepeatForever()));

            // LowCreditBalanceJob configuration - runs daily at 3:00 AM UTC
            var lowCreditBalanceJobKey = new JobKey("LowCreditBalanceJob");
            quartz.AddJob<LowCreditBalanceJob>(opts => opts.WithIdentity(lowCreditBalanceJobKey));

            quartz.AddTrigger(opts => opts
                .ForJob(lowCreditBalanceJobKey)
                .WithIdentity("LowCreditBalanceJob-trigger")
                .StartNow()
                .WithCronSchedule("0 0 3 * * ? *", x => x.InTimeZone(TimeZoneInfo.Utc))
                .WithDescription("Trigger for Low Credit Balance Job - Runs at 3:00 AM UTC daily"));

            // SubscriptionRenewalReminderJob configuration - runs daily at 4:00 AM UTC
            var subscriptionRenewalReminderJobKey = new JobKey("SubscriptionRenewalReminderJob");
            quartz.AddJob<SubscriptionRenewalReminderJob>(opts => opts.WithIdentity(subscriptionRenewalReminderJobKey));

            quartz.AddTrigger(opts => opts
                .ForJob(subscriptionRenewalReminderJobKey)
                .WithIdentity("SubscriptionRenewalReminderJob-trigger")
                .StartNow()
                .WithCronSchedule("0 0 4 * * ? *", x => x.InTimeZone(TimeZoneInfo.Utc))
                .WithDescription("Trigger for Subscription Renewal Reminder Job - Runs at 4:00 AM UTC daily"));

            // NotificationDispatchJob configuration - runs every 1 minute
            var notificationDispatchJobKey = new JobKey("NotificationDispatchJob");
            quartz.AddJob<NotificationDispatchJob>(opts => opts.WithIdentity(notificationDispatchJobKey));

            quartz.AddTrigger(opts => opts
                .ForJob(notificationDispatchJobKey)
                .WithIdentity("NotificationDispatchJob-trigger")
                .StartNow()
                .WithSimpleSchedule(x => x
                    .WithIntervalInMinutes(1)
                    .RepeatForever()));
        });

        // Register Quartz hosted service to ensure jobs run in the background
        services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

        // Register the jobs with the DI container so they can be injected
        services.AddTransient<TimeTriggerExecutionJob>();
        services.AddTransient<TenantHistoryCleanupJob>();
        services.AddTransient<ExecutionTimeoutMonitorJob>();
        services.AddTransient<LowCreditBalanceJob>();
        services.AddTransient<SubscriptionRenewalReminderJob>();
        services.AddTransient<NotificationDispatchJob>();
    }
}