

using MLModelBuilderAPIs.Hubs;

var builder = WebApplication.CreateBuilder(args);

/*---------appsettings and sharedsettings---------*/

// Build non senstive configuration from json files
var configurationBuilder = new ConfigurationBuilder();
configurationBuilder.Sources.Clear();
configurationBuilder.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
configurationBuilder.AddJsonFile("serilogsettings.json", optional: false, reloadOnChange: true);
configurationBuilder.AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", optional: true, reloadOnChange: true);
var config = configurationBuilder.Build();

if (!builder.Environment.IsEnvironment("Localhost"))
{
    // Get sensitive data from environment variables
    var DB_HOST = Guard.Against.Null(Environment.GetEnvironmentVariable("DB_HOST"), "DB_HOST cannot be null");
    var DB_CREDENTIALS = Guard.Against.Null(Environment.GetEnvironmentVariable("DB_CREDENTIALS"), "DB_CREDENTIALS cannot be null");
    var JWT_SECRET_KEY = Guard.Against.Null(Environment.GetEnvironmentVariable("JWT_SECRET_KEY"), "JWT_SECRET_KEY cannot be null");

    // Update sensitive data in configuration
    config = new ConfigurationBuilder().AddConfiguration(config).AddInMemoryCollection(new Dictionary<string, string?>
    {
        { "ConnectionStringConfig:AppDb:Credentials", DB_CREDENTIALS },
        { "ConnectionStringConfig:AppDb:Host", DB_HOST },
        { "ConnectionStringConfig:TenantDb:Credentials", DB_CREDENTIALS },
        { "ConnectionStringConfig:TenantDb:Host", DB_HOST },
        { "JwtConfig:SecretKey", JWT_SECRET_KEY }
    }).Build();
}

/*---------Serilog Configuration---------*/

Log.Logger = new LoggerConfiguration()
                    .ReadFrom.Configuration(config)
                    .Enrich.FromLogContext()
                    .CreateLogger();
builder.Host.UseSerilog();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

// RateLimiter
builder.Services.SharedRateLimiter(config);

// Security
builder.Services.CorsPolicyConfig(config);
builder.Services.CookiePolicyConfig(config);
builder.Services.HSTSPolicyConfig(config);
builder.Services.AddAuthenticationConfig(config);
builder.Services.AddSignalR();


// Database
builder.Services.AddDbContextConfig(config);

// ASP.NET & App services
builder.Services.AddHttpContextAccessor();
builder.Services.AddEmailService();
builder.Services.AddSharedDependencies(config);
builder.Services.AddAppDependencies(config);
builder.Services.AddMappingProfiles();
builder.Services.AddControllersConfig();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerConfig();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// app.UseRateLimiter();

if (app.Environment.IsEnvironment("Localhost"))
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

if (!app.Environment.IsEnvironment("Localhost")) app.UseHsts();

// In a Nginx setup with SSL termination, Nginx handles the HTTPS connection and forwards the request to your backend ASP.NET Core application using HTTP (port 80 by default).
if (app.Environment.IsEnvironment("Localhost")) app.UseHttpsRedirection();

app.UseSerilogRequestLogging();

app.UseStaticFiles();

app.UseCookiePolicy();

app.UseRouting();

app.UsePathBase(new PathString("/api"));

app.UseCors("CorsPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.UseMiddleware<TenantResolver>();

app.MapControllers();

app.MapHub<ExtractHub>("/extract-hub");

app.Run();
