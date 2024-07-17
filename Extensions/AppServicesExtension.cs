namespace AccountsAPIs.Extensions;

public static class AppServicesExtension
{
    /// <summary>
    /// Adds db context services
    /// </summary>
    public static void AddDbContextConfig(this IServiceCollection services, IConfiguration config)
    {
        var connConfig = Guard.Against.Null(config.GetSection("ConnectionStringConfig").Get<ConnectionStringConfig>(), "ConnectionStringConfig cannot be null");
        var appDbConnectionString = $"{connConfig.AppDb.Credentials}{connConfig.AppDb.Host}{connConfig.AppDb.Database}{connConfig.AppDb.Other}";
        var tenantDbConnectionString = $"{connConfig.TenantDb.Credentials}{connConfig.TenantDb.Host}{connConfig.TenantDb.Database}{connConfig.TenantDb.Other}";

        services.AddDbContext<AccountsDbContext>(options => options.UseNpgsql(appDbConnectionString));
        services.AddDbContext<TenantDbContext>(options => options.UseNpgsql(tenantDbConnectionString));
    }

    /// <summary>
    /// Adds MappingProfiles
    /// </summary>
    public static void AddMappingProfiles(this IServiceCollection services)
    {
        var mapperConfig = new MapperConfiguration(map =>
        {
            map.AddProfile<SessionLogMappingProfile>();
            map.AddProfile<TenantsTableMappingProfile>();
            map.AddProfile<AccountUsersTableMappingProfile>();
        });
        services.AddSingleton(mapperConfig.CreateMapper());
    }

    /// <summary>
    /// Adds Identity configuration
    /// </summary>
    public static void AddIdentityConfig(
        this IServiceCollection services,
        IConfiguration config)
    {
        var identityConfig = Guard.Against.Null(config.GetSection("IdentityConfig").Get<IdentityConfig>(), "IdentityConfig cannot be null");

        var builder = services.AddIdentity<AccountUser, AccountRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 8;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Lockout.AllowedForNewUsers = true;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(identityConfig.DefaultLockoutTimeSpanInMinutes);
            options.Lockout.MaxFailedAccessAttempts = identityConfig.LockoutMaxFailedAccessAttempts;
            options.SignIn.RequireConfirmedAccount = identityConfig.SignInRequireConfirmedAccount;
            options.SignIn.RequireConfirmedEmail = identityConfig.SignInRequireConfirmedEmail;
            options.SignIn.RequireConfirmedPhoneNumber = identityConfig.SignInRequireConfirmedPhoneNo;
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<AccountsDbContext>()
        .AddDefaultTokenProviders();
    }

    /// <summary>
    /// Adds app dependencies like appsettings.json config and Services
    /// </summary>
    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {
        // Signleton
        services.AddSingleton(Guard.Against.Null(config.GetSection("EmailConfig").Get<EmailConfig>(), "EmailConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("TenantDefaultConfig").Get<TenantDefaultConfig>(), "TenantDefaultConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("DefaultUsersConfig").Get<DefaultUsersConfig>(), "DefaultUsersConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("IdentityConfig").Get<IdentityConfig>(), "IdentityConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("VerificationCodeConfig").Get<VerificationCodeConfig>(), "VerificationCodeConfig cannot be null"));
        services.AddSingleton(Guard.Against.Null(config.GetSection("ExternalAPIsConfig").Get<ExternalAPIsConfig>(), "ExternalAPIsConfig cannot be null"));

        // Feature services
        services.AddScoped<ICreateAccountService, CreateAccountService>();
        services.AddScoped<IVerificationCodeService, VerificationCodeService>();
        services.AddScoped<IResetPwdService, ResetPwdService>();
        services.AddScoped<ILoginWithPwdService, LoginWithPwdService>();
        services.AddScoped<ISingleSignOnService, SingleSignOnService>();
        services.AddScoped<IMyAccountService, MyAccountService>();
        services.AddScoped<ITenantAccountService, TenantAccountService>();
        services.AddScoped<ITenantsTableService, TenantsTableService>();
        services.AddScoped<IAccountUsersTableService, AccountUsersTableService>();

        // Common Services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAuthHelperService, AuthHelperService>();
        services.AddScoped<IAuthService, AuthService>();
    }
}