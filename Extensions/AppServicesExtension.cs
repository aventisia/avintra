
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
    }

    public static void AddMappingProfiles(this IServiceCollection services)
    {
        // Mapster mapping profiles
        var config = TypeAdapterConfig.GlobalSettings;
        config.Apply(new MLModelMappingProfile());
        config.Apply(new ExtractedDataMappingProfile());
        config.Apply(new UploadedDocMappingProfile());
        config.Apply(new ModelBuilderUserMappingProfile());
        config.Apply(new ExtractionSetupMappingProfile());
        config.Apply(new SentimentAnalyticsMappingProfile());
        config.Apply(new ClassificationMappingProfile());
        config.Apply(new SummarizationMappingProfile());
        config.Apply(new QuestionAnswerMappingProfile());
        config.Apply(new AIPersonaMappingProfile());
        config.Apply(new ModelAPIKeyMappingProfile());

        services.AddSingleton(config);
    }

    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {
        // Signleton
        services.AddSingleton(Guard.Against.Null(config.GetSection("SmtpConfig").Get<SmtpConfig>(), "SmtpConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("ExtractViaLLMConfig").Get<ExtractViaLLMConfig>(), "ExtractViaLLMConfig cannot be null"));

        //Feature Services
        services.AddScoped<IMLModelService, MLModelService>();
        services.AddScoped<IExtractedDataService, ExtractedDataService>();
        services.AddScoped<IUploadedDocService, UploadedDocService>();
        services.AddScoped<IModelBuilderUserService, ModelBuilderUserService>();
        services.AddScoped<IExtractViaLLMService, ExtractViaLLMService>();
        services.AddScoped<IExtractionSetupService, ExtractionSetupService>();
        services.AddScoped<ISentimentAnalyticsService, SentimentAnalyticsService>();
        services.AddScoped<IClassificationService, ClassificationService>();
        services.AddScoped<ISummarizationService, SummarizationService>();
        services.AddScoped<IQuestionAnswerService, QuestionAnswerService>();
        services.AddScoped<IAIPersonaService, AIPersonaService>();
        services.AddScoped<IModelAPIKeyService, ModelAPIKeyService>();

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