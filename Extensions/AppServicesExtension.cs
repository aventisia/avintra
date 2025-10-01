
namespace MLModelBuilderAPIs.Extensions;

public static class AppServicesExtension
{
    public static void AddDbContextConfig(this IServiceCollection services, IConfiguration config)
    {
        var connConfig = Guard.Against.Null(config.GetSection("ConnectionStringConfig").Get<ConnectionStringConfig>(), "ConnectionStringConfig cannot be null");
        var appDbConnectionString = $"{connConfig.AppDb.Credentials}{connConfig.AppDb.Host}{connConfig.AppDb.Database}{connConfig.AppDb.Other}";
        var tenantDbConnectionString = $"{connConfig.TenantDb.Credentials}{connConfig.TenantDb.Host}{connConfig.TenantDb.Database}{connConfig.TenantDb.Other}";

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
        config.Apply(new AIProjectApiKeyMappingProfile());
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
        services.AddSingleton(Guard.Against.Null(config.GetSection("SmtpConfig").Get<SmtpConfig>(), "SmtpConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("ExtractViaLLMConfig").Get<ExtractViaLLMConfig>(), "ExtractViaLLMConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("APIKeyConfig").Get<APIKeyConfig>(), "APIKeyConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("DefaultTenantConfig").Get<DefaultTenantConfig>(), message: "DefaultTenantConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("OpenAIConfig").Get<OpenAIConfig>(), message: "OpenAIConfig cannot be null"));

        //Feature Services
        services.AddScoped<IAIProjectService, AIProjectService>();
        services.AddScoped<IExtractedDataService, ExtractedDataService>();
        services.AddScoped<IVersionResourceService, VersionResourceService>();
        services.AddScoped<IModelBuilderUserService, ModelBuilderUserService>();
        services.AddScoped<IAIProjectApiKeyService, AIProjectApiKeyService>();
        services.AddScoped<IAIModelService, AIModelService>();
        services.AddScoped<IInferencingModelService, InferencingModelService>();
        services.AddScoped<IConversationModelService, ConversationModelService>();
        services.AddScoped<IGenerativeModelService, GenerativeModelService>();
        services.AddScoped<IAIProjectVersionService, AIProjectVersionService>();
        services.AddScoped<IMLModelTemplateService, MLModelTemplateService>();
        services.AddScoped<IAIProjectUserService, AIProjectUserService>();
        services.AddScoped<IConversationHistoryService, ConversationHistoryService>();

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