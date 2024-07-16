namespace WorkspaceAPIs.Extensions;

public static class AppServicesExtension
{
    public static void AddDbContextConfig(this IServiceCollection services, IConfiguration config)
    {
        var connConfig = Guard.Against.Null(config.GetSection("ConnectionStringConfig").Get<ConnectionStringConfig>(), "ConnectionStringConfig cannot be null");
        var appDbConnectionString = $"{connConfig.AppDb.Credentials}{connConfig.AppDb.Host}{connConfig.AppDb.Database}{connConfig.AppDb.Other}";
        var tenantDbConnectionString = $"{connConfig.TenantDb.Credentials}{connConfig.TenantDb.Host}{connConfig.TenantDb.Database}{connConfig.TenantDb.Other}";

        services.AddDbContext<WorkspaceDbContext>(options => options.UseNpgsql(appDbConnectionString));
        services.AddDbContext<TenantDbContext>(options => options.UseNpgsql(tenantDbConnectionString));
    }

    public static void AddMappingProfiles(this IServiceCollection services)
    {
        var mapperConfig = new MapperConfiguration(map =>
        {
            map.AddProfile<WorkspaceUserMappingProfile>();
            map.AddProfile<ProjectsTableMappingProfile>();
            map.AddProfile<GlobalNotificationMappingProfile>();
        });
        services.AddSingleton(mapperConfig.CreateMapper());
    }

    public static void AddAppDependencies(this IServiceCollection services, IConfiguration config)
    {

        // Signleton
        services.AddSingleton(Guard.Against.Null(config.GetSection("EmailConfig").Get<EmailConfig>(), "EmailConfig cannot be null"));
        
        // Feature Services
        services.AddScoped<IWorkspaceUserService, WorkspaceUserService>();
        services.AddScoped<IProjectsTableService, ProjectsTableService>();
        services.AddScoped<INotificationHelperService, NotificationHelperService>();
        services.AddScoped<IGlobalNotificationService, GlobalNotificationService>();

        // Common services
        services.AddScoped<IUnitOfWork, UnitOfWork>();
    }
}