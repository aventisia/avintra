using Serilog;
using WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;
using WorkspaceAPIs.Features.Chats.StreamingChat.Service;

EnvironmentConfigurationExtension.LoadDotEnvForKestrel();
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
builder.Services.AddAuthenticationConfig(config);
builder.Services.AddSignalRConfig();

// Database
builder.Services.AddDbContextConfig(config);

// ASP.NET & App services
builder.Services.AddHttpContextAccessor();
builder.Services.AddEmailService();
builder.Services.AddLLMExtractionService();
builder.Services.AddSharedDependencies(config);
builder.Services.AddAppDependencies(config);
builder.Services.AddMappingProfiles();
builder.Services.AddControllersConfig();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerConfig();
builder.Services.AddSwaggerGen();
builder.Services.AddQuartzJobs();
builder.Services.AddStringEncryptionService();
builder.Services.AddUploadFileService();
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("Corsair", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
}).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    // The sidecar returns 302 redirects for the OAuth connect/callback flow.
    // We must read the Location header ourselves (to proxy the browser onward),
    // so disable automatic redirect following.
    AllowAutoRedirect = false
});
builder.Services.AddHttpClient("CustomTool", client =>
{
    // IMPORTANT NOTE: CustomToolTransportHelpers owns the 30-second upstream budget; a client timeout would race it and surface as a 500 instead of a 504.
    client.Timeout = Timeout.InfiniteTimeSpan;
}).ConfigurePrimaryHttpMessageHandler(CustomToolHttpHandlerFactory.Create);
builder.Services.AddHttpClient(StreamingChatService.LlmPipelineStreamClientName, client => client.Timeout = Timeout.InfiniteTimeSpan);
builder.Services.AddHttpClient("LLMPipeline", client =>
{
    var appBaseUrl = config["EnvironmentConfig:AppBaseUrl"]?.Trim().TrimEnd('/');
    if (!string.IsNullOrWhiteSpace(appBaseUrl))
    {
        client.BaseAddress = new Uri($"https://{appBaseUrl}/llmpipeline/");
    }
    // IMPORTANT NOTE: a tool test spends up to 5 s on DNS, 60 s on the vault fetch and 30 s upstream in LLMPipeline, so this must stay above that budget.
    client.Timeout = TimeSpan.FromSeconds(120);
});
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

if (!isEnvironmentLocalhost) app.UseHsts();

// In a Nginx setup with SSL termination, Nginx handles the HTTPS connection and forwards the request to your backend ASP.NET Core application using HTTP (port 80 by default).
// if (isEnvironmentLocalhost) app.UseHttpsRedirection();

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

app.UseMiddleware<SessionValidator>();

app.UseMiddleware<TenantResolver>();

app.MapControllers();

app.MapHub<OrchestratorHub>("/orchestrator-hub");
app.MapHub<AgentBuilderHub>("/agentbuilder/hub");
app.MapHub<FlowExecutionHub>("/hubs/flow-execution");

await app.SeedInitialData();

await app.RunAsync();
