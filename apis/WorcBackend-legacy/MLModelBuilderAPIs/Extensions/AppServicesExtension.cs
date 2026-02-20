
namespace MLModelBuilderAPIs.Extensions;

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
        var appDbConnectionString = $"Host={pgHost};Port={pgPort};Username={pgUsername};Password={pgPassword};Database=AIModelBuilderDb;Include Error Detail=true";
        var tenantDbConnectionString = $"Host={pgHost};Port={pgPort};Username={pgUsername};Password={pgPassword};Database=AccountsDb;Include Error Detail=true";

        services.AddDbContext<MLModelBuilderDbContext>(options => options.UseNpgsql(appDbConnectionString));
        services.AddDbContext<TenantDbContext>(options => options.UseNpgsql(tenantDbConnectionString));
        services.AddDbContext<APIKeyDbContext>(options => options.UseNpgsql(appDbConnectionString));
    }

    public static void AddMappingProfiles(this IServiceCollection services)
    {
        // Mapster mapping profiles
        var config = TypeAdapterConfig.GlobalSettings;
        config.Apply(new AIProjecMappingProfile());
        config.Apply(new ExtractedDataMappingProfile());
        config.Apply(new VersionResourceMappingProfile());
        config.Apply(new ModelBuilderUserMappingProfile());
        config.Apply(new AIProjectVersionApiKeyMappingProfile());
        config.Apply(new AIModelMappingProfile());
        config.Apply(new InferencingModelMappingProfile());
        config.Apply(new ConversationModelMappingProfile());
        config.Apply(new GenerativeModelMappingProfile());
        config.Apply(new AIProjectVersionMappingProfile());
        config.Apply(new MLModelTemplateMappingProfile());
        config.Apply(new AIProjectUserMappingProfile());
        config.Apply(new ConversationHistoryMappingProfile());

        services.AddSingleton(config);
    }

    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {
        // Signleton
        services.AddSingleton(Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), "EnvironmentConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("AppDefaultConfig").Get<AppDefaultConfig>(), "AppDefaultConfig cannot be null"));

        //Feature Services
        services.AddScoped<IAIProjectService, AIProjectService>();
        services.AddScoped<IExtractedDataService, ExtractedDataService>();
        services.AddScoped<IVersionResourceService, VersionResourceService>();
        services.AddScoped<IModelBuilderUserService, ModelBuilderUserService>();
        services.AddScoped<IAIProjectVersionApiKeyService, AIProjectVersionApiKeyService>();
        services.AddScoped<IAIModelService, AIModelService>();
        services.AddScoped<IInferencingModelService, InferencingModelService>();
        services.AddScoped<IConversationModelService, ConversationModelService>();
        services.AddScoped<IGenerativeModelService, GenerativeModelService>();
        services.AddScoped<IAIProjectVersionService, AIProjectVersionService>();
        services.AddScoped<IMLModelTemplateService, MLModelTemplateService>();
        services.AddScoped<IAIProjectUserService, AIProjectUserService>();
        services.AddScoped<IConversationHistoryService, ConversationHistoryService>();
        services.AddScoped<IManageTenantService, ManageTenantService>();

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
}