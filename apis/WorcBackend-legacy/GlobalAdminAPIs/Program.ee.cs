using Serilog;

EnvironmentConfigurationExtensions.LoadDotEnvForKestrel();
var builder = WebApplication.CreateBuilder(args);

/*---------appsettings and sharedsettings---------*/

// Build non senstive configuration from json files
var configurationBuilder = new ConfigurationBuilder();
configurationBuilder.Sources.Clear();
configurationBuilder.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
configurationBuilder.AddJsonFile("serilogsettings.json", optional: false, reloadOnChange: true);
configurationBuilder.AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", optional: true, reloadOnChange: true);
var config = configurationBuilder.Build();

var isEnvironmentLocalhost = builder.Environment.IsEnvironment("Localhost");

config = config.LoadEnvironmentConfiguration(isEnvironmentLocalhost);

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
builder.Services.AddAuthenticationConfig(config);

// Database
builder.Services.AddDbContextConfig(config);

// ASP.NET & App services
builder.Services.AddHttpContextAccessor();
builder.Services.AddSharedDependencies(config);
builder.Services.AddAppDependencies(config);
builder.Services.AddMappingProfiles();
builder.Services.AddControllersConfig();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerConfig();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();
/*--Configure the HTTP request pipeline.--*/

var app = builder.Build();

if (app.Environment.IsEnvironment("Localhost"))
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

if (!app.Environment.IsEnvironment("Localhost")) app.UseHsts();

// In a Nginx setup with SSL termination, Nginx handles the HTTPS connection and forwards the request to your backend ASP.NET Core application using HTTP (port 80 by default).
// if (app.Environment.IsEnvironment("Localhost")) app.UseHttpsRedirection();

app.UseSerilogRequestLogging();

app.UseStaticFiles();

app.UseCookiePolicy();

app.UseRouting();

app.UsePathBase(new PathString("/api"));

app.UseCors("CorsPolicy");

app.UseAuthentication();

app.UseAuthorization();

// app.UseMiddleware<TenantResolver>();

app.MapControllers();

await app.SeedInitialData();

await app.RunAsync();