namespace GlobalAdminAPIs.Extensions;

public static class AppServicesExtension
{
    /// <summary>
    /// Adds db context services
    /// </summary>
    public static void AddDbContextConfig(this IServiceCollection services, IConfiguration config)
    {
        var environmentConfig = Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), message: "EnvironmentConfig cannot be null");

        // Read PostgreSQL settings from environment variables or config
        var pgHost = environmentConfig.PostgresqlHost ?? "localhost";
        var pgPort = environmentConfig.PostgresqlPort.ToString() ?? "5432";
        var pgUsername = environmentConfig.PostgresqlUsername ?? "";
        var pgPassword = environmentConfig.PostgresqlPassword ?? "";

        // Build connection strings for different databases
        var appDbConnectionString = $"Host={pgHost};Port={pgPort};Username={pgUsername};Password={pgPassword};Database=GlobalAdminDb;Include Error Detail=true";
        services.AddDbContext<GlobalAdminDbContext>(options => options.UseNpgsql(appDbConnectionString));
    }

    /// <summary>
    /// Adds MappingProfiles
    /// </summary>
    public static void AddMappingProfiles(this IServiceCollection services)
    {
        // Mapster mapping profiles
        var config = TypeAdapterConfig.GlobalSettings;
        config.Apply(new OnPremTenantMappingProfile());
        config.Apply(new OnPremInstanceMappingProfile());
        config.Apply(new OnPremInstanceDataMappingProfile());
        services.AddSingleton(config);
    }

    /// <summary>
    /// Adds app dependencies like appsettings.json config and Servi ces
    /// </summary>
    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {
        // Feature services
        services.AddScoped<IOnPremTenantService, OnPremTenantService>();
        services.AddScoped<IOnPremInstanceService, OnPremInstanceService>();
        services.AddScoped<IOnPremInstanceDataService, OnPremInstanceDataService>();
        services.AddScoped<IOnPremInstanceValidationService, OnPremInstanceValidationService>();

        // Common Services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IEmailRateLimiterService, EmailRateLimiterService>();
        services.AddScoped<ICurrentOnPremTenantService, CurrentOnPremTenantService>();
    }

    public static void CorsPolicyConfig(this IServiceCollection services, IConfiguration config)
    {
        var appDefaultConfig = Guard.Against.Null(config.GetSection("AppDefaultConfig").Get<AppDefaultConfig>(), message: "AppDefaultConfig cannot be null");

        services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy",
                builder => builder.AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins(appDefaultConfig.CorsOrigins.ToArray()));
        });
    }
    public static void CookiePolicyConfig(this IServiceCollection services, IConfiguration config)
    {
        // Microsoft.AspNetCore.Http.SameSiteMode.Strict
        // Microsoft.AspNetCore.Http.SameSiteMode.None
        // Microsoft.AspNetCore.Http.SameSiteMode.Lax
        services.Configure<CookiePolicyOptions>(options =>
        {
            options.MinimumSameSitePolicy = Microsoft.AspNetCore.Http.SameSiteMode.None;
            options.HttpOnly = HttpOnlyPolicy.Always;
            options.Secure = CookieSecurePolicy.Always;
        });
    }

    public static void HSTSPolicyConfig(this IServiceCollection services, IConfiguration config)
    {
        services.AddHsts(options =>
        {
            options.Preload = true;
            options.IncludeSubDomains = true;
            options.MaxAge = TimeSpan.FromDays(60);
            options.ExcludedHosts.Add("example.com");
            options.ExcludedHosts.Add("www.example.com");
        });

        services.AddHttpsRedirection(options =>
        {
            options.RedirectStatusCode = (int)HttpStatusCode.TemporaryRedirect;
            options.HttpsPort = 5001;
        });
    }

    public static void AddAuthenticationConfig(this IServiceCollection services, IConfiguration config)
    {
        var environmentConfig = Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), message: "EnvironmentConfig cannot be null");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.IncludeErrorDetails = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ClockSkew = TimeSpan.Zero,
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = "",
                ValidAudience = "",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(environmentConfig.JwtSecretKey))
            };
            options.SaveToken = false;
            options.RequireHttpsMetadata = true;
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (context.Request.Cookies.ContainsKey(CookieNamesEnum.AccessToken.ToString()))
                    {
                        context.Token = context.Request.Cookies[CookieNamesEnum.AccessToken.ToString()];
                    }
                    return Task.CompletedTask;
                }
            };
        });
    }
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
        services.AddSingleton(Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), "EnvironmentConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("AppDefaultConfig").Get<AppDefaultConfig>(), "AppDefaultConfig cannot be null"));
    }

    public static void SharedRateLimiter(this IServiceCollection services, IConfiguration config)
    {
        // Load rate limiter configuration from appsettings.json
        var rateLimiterConfig = config.GetSection("AppDefaultConfig:RateLimiterConfig").Get<RateLimiterConfig>() ?? new RateLimiterConfig();

        // Register the global rate limiter
        services.AddRateLimiter(options =>
        {
            // Partitioned rate limiter allows creating a limiter per client (IP/user/endpoint)
            options.GlobalLimiter =
                PartitionedRateLimiter.Create<HttpContext, string>(context =>
                {
                    // Get client IP address
                    var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                                ?? context.Connection.RemoteIpAddress?.ToString();

                    // Get user ID if the user is authenticated
                    var userId = context.User?.Identity?.IsAuthenticated == true
                        ? context.User?.FindFirstValue("uid")
                        : string.Empty;

                    // Get host as a fallback if IP is not available
                    var host = context?.Request.Host.Host;

                    // Construct the client identifier:
                    // - Authenticated users: combine IP + userId
                    // - Unauthenticated users: use IP or host
                    var clientId = !string.IsNullOrEmpty(userId)
                        ? $"{ip ?? host}:{userId}"
                        : $"{ip ?? host ?? "unknown-client"}";

                    // Get request path (ensure lowercase for consistent matching)
                    var path = context?.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
                    Console.WriteLine($"Request from Client ID: {clientId}, for path {path}");

                    // Find endpoint-specific rate limiting configuration
                    var endpoint = rateLimiterConfig.Endpoints
                        .FirstOrDefault(f => path.Equals(f.Path, StringComparison.OrdinalIgnoreCase));

                    // Construct the rate limiter key
                    // - If endpoint config exists: use clientId + endpoint path
                    // - Otherwise: use clientId + "default"
                    var rateLimitKey = endpoint != null ? $"{clientId}:{endpoint.Path}" : $"{clientId}:default";
                    Console.WriteLine($"Rate Limit Key: {rateLimitKey}");

                    // If there is an endpoint-specific configuration, use its rules
                    if (endpoint != null)
                    {
                        return RateLimitPartition.GetFixedWindowLimiter(
                            rateLimitKey,
                            _ => new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = endpoint.PermitLimit,
                                Window = TimeSpan.FromMinutes(endpoint.WindowInMinutes),
                                AutoReplenishment = true,
                                QueueLimit = 0
                            });
                    }

                    // Default rate limiting configuration
                    return RateLimitPartition.GetFixedWindowLimiter(
                        rateLimitKey,
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = rateLimiterConfig.Default.PermitLimit,
                            Window = TimeSpan.FromMinutes(rateLimiterConfig.Default.WindowInMinutes),
                            AutoReplenishment = true,
                            QueueLimit = rateLimiterConfig.Default.QueueLimit,
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
                        });
                });

            // Action to perform when a request is rejected due to rate limiting
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = 429; // HTTP 429 Too Many Requests
                await context.HttpContext.Response.WriteAsync(
                    "Too many requests. Please try later again... ",
                    cancellationToken: token
                );
            };
        });
    }
}