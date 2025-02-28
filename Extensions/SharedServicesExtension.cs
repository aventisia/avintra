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
                Title = "AVENTISIA APIs",
                Version = "v1",
                Description = "AVENTISIA API Services",
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
        services.AddSingleton(Guard.Against.Null(config.GetSection("ConnectionStringConfig").Get<ConnectionStringConfig>(), "ConnectionStringConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("GeneralConfig").Get<GeneralConfig>(), "GeneralConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("CookiePolicyConfig").Get<CookiePolicyConfig>(), "CookiePolicyConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("JwtConfig").Get<JwtConfig>(), "JwtConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("TenantResolverConfig").Get<TenantResolverConfig>(), "TenantResolverConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("FileUploadConfig").Get<FileUploadConfig>(), "FileUploadConfig cannot be null"));


        // Scoped
        services.AddScoped<ICurrentTenantService, CurrentTenantService>();
        services.AddScoped<IUserManagementGuardService, UserManagementGuardService>();
    }

    public static void AddEmailService(this IServiceCollection services)
    {
        services.AddSingleton<IEmailService, EmailService>();
    }
}