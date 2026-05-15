using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.CookiePolicy;

namespace AspNetToolkit.Extensions;

public static class SecurityServicesExtension
{
    public static void CorsPolicyConfig(this IServiceCollection services, IConfiguration config)
    {
        var environmentConfig = Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), message: "EnvironmentConfig cannot be null");
        var corsOrigins = environmentConfig.CorsOrigins.Split(';', StringSplitOptions.RemoveEmptyEntries).ToArray();

        services.AddCors(options =>
        {
            options.AddDefaultPolicy(
                builder => builder.AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins(corsOrigins));
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
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = $"https://{environmentConfig.AppBaseUrl}",
                ValidAudience = $"https://{environmentConfig.AppBaseUrl}",
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
                },
                OnChallenge = context =>
                {
                    context.HandleResponse();
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "text/plain";
                    return context.Response.WriteAsync("Unauthorized");
                },
                OnForbidden = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "text/plain";
                    return context.Response.WriteAsync("Forbidden");
                }
            };
        });

    }
}