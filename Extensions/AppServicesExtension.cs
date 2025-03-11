
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
        config.Apply(new DataFieldMappingProfile());
        config.Apply(new UploadedDocMappingProfile());
        config.Apply(new ModelBuilderUserMappingProfile());
        config.Apply(new AnnotationDataMappingProfile());
        config.Apply(new LLMMappingProfile());

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
        services.AddScoped<IDataFieldService, DataFieldService>();
        services.AddScoped<IUploadedDocService, UploadedDocService>();
        services.AddScoped<IModelBuilderUserService, ModelBuilderUserService>();
        services.AddScoped<IAnnotationDataService, AnnotationDataService>();
        services.AddScoped<IExtractViaLLMService, ExtractViaLLMService>();
        services.AddScoped<ILLMService, LLMService>();

        
        // Common services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
    }
}