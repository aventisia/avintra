using Serilog;

var builder = WebApplication.CreateBuilder(args);

/*---------appsettings and sharedsettings---------*/

// Build non senstive configuration from json files
var configurationBuilder = new ConfigurationBuilder();
configurationBuilder.Sources.Clear();
configurationBuilder.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
configurationBuilder.AddJsonFile("serilogsettings.json", optional: false, reloadOnChange: true);
configurationBuilder.AddJsonFile(
    $"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json",
    optional: true,
    reloadOnChange: true
);
var config = configurationBuilder.Build();

var isEnvironmentLocalhost = builder.Environment.IsEnvironment("Localhost");

// Load environment variables into configuration
config = config.LoadEnvironmentConfiguration(isEnvironmentLocalhost);

// Merge env-enriched config into builder.Configuration so ASP.NET Core middleware
// (e.g. Host Filtering, CORS) actually reads the computed values like AllowedHosts.
builder.Configuration.AddConfiguration(config);

/*---------Serilog Configuration---------*/

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(config)
    .Enrich.FromLogContext()
    .CreateLogger();
builder.Host.UseSerilog();

/*-----Add services to the container-----*/

// RateLimiter
builder.Services.SharedRateLimiter(config);

// Security
builder.Services.CorsPolicyConfig(config);
builder.Services.CookiePolicyConfig(config);
builder.Services.HSTSPolicyConfig(config);
builder.Services.AddIdentityConfig(config); // Note: AddIdentity must come before AddAuthentication
builder.Services.AddAuthenticationConfig(config);

// Database
builder.Services.AddDbContextConfig(config);

// Razorpay client
builder.Services.AddRazorpayClient(config);

// ASP.NET & App services
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();

builder.Services.AddEmailService();
builder.Services.AddSharedDependencies(config);
builder.Services.AddAppDependencies(config);
builder.Services.AddMappingProfiles();
builder.Services.AddControllersConfig();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerConfig();
builder.Services.AddSwaggerGen();
builder.Services.AddQuartzJobs();
builder.Services.AddAzureBlobStorageService();
/*--Configure the HTTP request pipeline.--*/

var app = builder.Build();

if (isEnvironmentLocalhost)
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

if (!isEnvironmentLocalhost)
    app.UseHsts();

// In a Nginx setup with SSL termination, Nginx handles the HTTPS connection and forwards the request to your backend ASP.NET Core application using HTTP (port 80 by default).
// if (!isEnvironmentLocalhost) app.UseHttpsRedirection();

app.UseSerilogRequestLogging();

app.UseCookiePolicy();

app.UsePathBase(new PathString("/api"));

app.UseRouting();

app.UseCors();

app.UseAuthentication();

app.UseAuthorization();

// Method-specific rate limiting (thresholds from appsettings.json RateLimiterConfig:HttpMethods).
// Placed after UseAuthorization so the client id can include the authenticated user id.
app.UseMethodRateLimiter();

app.UseMiddleware<TenantRouteAccessMiddleware>();

app.UseMiddleware<SessionValidator>();

app.UseMiddleware<TenantResolver>();

app.MapControllers();

await app.SeedInitialData();

await app.RunAsync();
