using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.CookiePolicy;

namespace AspNetToolkit.Extensions;

public static class SecurityServicesExtension
{
    public static void CorsPolicyConfig(this IServiceCollection services, IConfiguration config)
    {
        var corsOrigins = Guard.Against.Null(config.GetSection("CorsOrigins").Get<List<string>>(), "CorsOrigins cannot be null");

        services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy",
                builder => builder.AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins(corsOrigins.ToArray()));
        });
    }

    public static void CookiePolicyConfig(this IServiceCollection services, IConfiguration config)
    {
        var cookiePolicyConfig = Guard.Against.Null(config.GetSection("CookiePolicyConfig").Get<CookiePolicyConfig>(), "CookiePolicyConfig cannot be null");

        var minimumSameSitePolicy = Microsoft.AspNetCore.Http.SameSiteMode.Strict;
        switch (cookiePolicyConfig.SameSiteMode)
        {
            case "None":
                minimumSameSitePolicy = Microsoft.AspNetCore.Http.SameSiteMode.None;
                break;
            case "Lax":
                minimumSameSitePolicy = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
                break;
        }

        services.Configure<CookiePolicyOptions>(options =>
        {
            options.MinimumSameSitePolicy = minimumSameSitePolicy;
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
        var jwtConfig = Guard.Against.Null(config.GetSection("JwtConfig").Get<JwtConfig>(), "JwtConfig cannot be null");

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
                ValidIssuer = jwtConfig.Issuer,
                ValidAudience = jwtConfig.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig.SecretKey))
            };
            options.SaveToken = true;
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
}