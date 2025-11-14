using Serilog;

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
    var DB_HOST = Guard.Against.Null(Environment.GetEnvironmentVariable("DB_HOST"), message: "DB_HOST cannot be null");
    var DB_CREDENTIALS = Guard.Against.Null(Environment.GetEnvironmentVariable("DB_CREDENTIALS"), message: "DB_CREDENTIALS cannot be null");
    var JWT_SECRET_KEY = Guard.Against.Null(Environment.GetEnvironmentVariable("JWT_SECRET_KEY"), message: "JWT_SECRET_KEY cannot be null");
    var SMTP_API_KEY = Guard.Against.Null(Environment.GetEnvironmentVariable("SMTP_API_KEY"), message: "SMTP_API_KEY cannot be null");
    var OPENAI_API_KEY = Guard.Against.Null(Environment.GetEnvironmentVariable("OPENAI_API_KEY"), message: "OPENAI_API_KEY cannot be null");
    var AES_ENCRYPTION_KEY = Guard.Against.Null(Environment.GetEnvironmentVariable("AES_ENCRYPTION_KEY"), message: "AES_ENCRYPTION_KEY cannot be null");
    var AES_INITIALIZATION_VECTOR = Guard.Against.Null(Environment.GetEnvironmentVariable("AES_INITIALIZATION_VECTOR"), message: "AES_INITIALIZATION_VECTOR cannot be null");

    // Update sensitive data in configuration
    config = new ConfigurationBuilder().AddConfiguration(config).AddInMemoryCollection(new Dictionary<string, string?>
    {
        { "ConnectionStringConfig:AppDb:Credentials", DB_CREDENTIALS },
        { "ConnectionStringConfig:AppDb:Host", DB_HOST },
        { "ConnectionStringConfig:TenantDb:Credentials", DB_CREDENTIALS },
        { "ConnectionStringConfig:TenantDb:Host", DB_HOST },
        { "JwtConfig:SecretKey", JWT_SECRET_KEY },
        { "SmtpConfig:ApiKey", SMTP_API_KEY },
        { "OpenAIConfig:OpenAIApiKey", OPENAI_API_KEY },
        { "AesEncryptionConfig:AES_ENCRYPTION_KEY", AES_ENCRYPTION_KEY },
        { "AesEncryptionConfig:AES_INITIALIZATION_VECTOR", AES_INITIALIZATION_VECTOR }
    }).Build();
}

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
builder.Services.AddHttpClientService(config);
/*--Configure the HTTP request pipeline.--*/

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
// if (app.Environment.IsEnvironment("Localhost")) app.UseHttpsRedirection();

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

app.MapHub<MachineHub>("/machine-hub");

await app.RunAsync();