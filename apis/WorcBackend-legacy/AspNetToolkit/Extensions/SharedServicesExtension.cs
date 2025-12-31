namespace AspNetToolkit.Extensions;

public static class SharedServicesExtension
{
    public static void AddControllersConfig(this IServiceCollection services)
    {
        services.AddControllers(config =>
        {
            config.CacheProfiles.Add("30SecondsCaching", new CacheProfile
            {
                Duration = 30
            });
        }).AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });
    }

    public static void AddSwaggerConfig(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Aventisia APIs",
                Version = "v1",
                Description = "Aventisia API Services",
            });
            c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Jwt Authorization header using the Bearer scheme."
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] {}
                }
            });
        });
    }

    public static void AddSharedDependencies(this IServiceCollection services, IConfiguration config)
    {
        // Singleton
        services.AddSingleton(config);
        services.AddSingleton(Guard.Against.Null(config.GetSection("ConnectionStringConfig").Get<ConnectionStringConfig>(), message: "ConnectionStringConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("GeneralConfig").Get<GeneralConfig>(), message: "GeneralConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("CookiePolicyConfig").Get<CookiePolicyConfig>(), message: "CookiePolicyConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("JwtConfig").Get<JwtConfig>(), message: "JwtConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("TenantResolverConfig").Get<TenantResolverConfig>(), message: "TenantResolverConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("FileUploadConfig").Get<FileUploadConfig>(), message: "FileUploadConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("HttpClientUrlConfig").Get<HttpClientUrlConfig>(), message: "HttpClientUrlConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("RateLimiterConfig").Get<RateLimiterConfig>(), message: "RateLimiterConfig cannot be null"));

        // Scoped
        services.AddScoped<ICurrentTenantService, CurrentTenantService>();
        services.AddScoped<IUserManagementGuardService, UserManagementGuardService>();
        services.AddScoped<ISessionValidationService, SessionValidationService>();
    }

    // Method to add the email service to the service collection
    public static void AddEmailService(this IServiceCollection services)
    {
        // Register EmailService as a singleton for IEmailService
        services.AddSingleton<IEmailService, EmailService>();
    }

    // Method to add the string encryption service to the service collection
    public static void AddStringEncryptionService(this IServiceCollection services)
    {
        // Register StringEncryptionService as a singleton for IStringEncryptionService
        services.AddSingleton<IStringEncryptionService, StringEncryptionService>();
    }

    // Method to add the http client service to the service collection
    public static void AddHttpClientService(this IServiceCollection services, IConfiguration config)
    {
        var urlConfig = Guard.Against.Null(config.GetSection("HttpClientUrlConfig").Get<HttpClientUrlConfig>(),
            message: "HttpClientUrlConfig cannot be null");

        services.AddHttpClient(nameof(HttpClientNamesEnum.ModelStudioApis), config =>
            config.BaseAddress = new(urlConfig.ModelStudioApisBaseUrl));

        services.AddHttpClient(nameof(HttpClientNamesEnum.WorkspaceApis), config =>
            config.BaseAddress = new(urlConfig.WorkspaceApisBaseUrl));

        services.AddHttpClient(nameof(HttpClientNamesEnum.AccountsApis), config =>
            config.BaseAddress = new(urlConfig.AccountsApisBaseUrl));

        services.AddHttpClient(nameof(HttpClientNamesEnum.LlmPipelineApis), config =>
            config.BaseAddress = new(urlConfig.LlmPipelineApisBaseUrl));

    }

    // Method to add the upload file service to the service collection
    public static void AddUploadFileService(this IServiceCollection services)
    {
        // Register UploadFileService as a singleton for IUploadFileService
        services.AddSingleton<IUploadFileService, UploadFileService>();
    }

    // Method to add the permission validator service to the service collection
    public static void AddSPermissionValidatorService(this IServiceCollection services)
    {
        // Register PermissionValidator as a singleton implementation of IPermissionValidator
        services.AddSingleton<IPermissionValidator, PermissionValidator>();
    }

    // Extension method to register the LLM data extraction service
    public static void AddLLMExtractionService(this IServiceCollection services)
    {
        // Registers LLMDataExtractionService as a scoped implementation of ILLMDataExtractionService
        services.AddScoped<ILLMDataExtractionService, LLMDataExtractionService>();
    }
}