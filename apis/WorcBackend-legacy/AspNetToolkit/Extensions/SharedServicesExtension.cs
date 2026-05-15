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

        // Override default model validation response to return ServiceResponse shape
        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var errors = context.ModelState
                    .Where(e => e.Value?.Errors.Count > 0)
                    .SelectMany(e => e.Value!.Errors.Select(err => err.ErrorMessage))
                    .ToList();

                var message = string.Join("; ", errors);
                if (string.IsNullOrEmpty(message))
                    message = "Validation failed";

                return new ContentResult
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Content = message,
                    ContentType = "text/plain"
                };
            };
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
        services.AddSingleton(Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), message: "EnvironmentConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("AppDefaultConfig").Get<AppDefaultConfig>(), message: "AppDefaultConfig cannot be null"));

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

    // Method to add the upload file service to the service collection
    public static void AddUploadFileService(this IServiceCollection services)
    {
        // Register UploadFileService as a add dcoped for IUploadFileService
        services.AddScoped<IUploadFileService, UploadFileService>();
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

    // Method to add the Azure Blob Storage service to the service collection
    public static void AddAzureBlobStorageService(this IServiceCollection services)
    {
        // Register your AzureBlobStorageService implementation
        services.AddSingleton<IAzureBlobStorageService, AzureBlobStorageService>();
    }
}