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

var IsEnvironmentLocalhost = builder.Environment.IsEnvironment("Localhost");

// Try to parse the TenantType from configuration
var tenantTypeValue = builder.Configuration["InstanceConfig:TenantType"];

if (Enum.TryParse(tenantTypeValue, true, out OnPremTenantTypesEnum tenantType) && Enum.IsDefined(typeof(OnPremTenantTypesEnum), tenantType))
{
    // Valid tenant type - you can add logic here if needed.
}
else
{
    // Invalid tenant type - throw an exception
    throw new InvalidOperationException($"Invalid Tenant Type in configuration: '{tenantTypeValue}'");
}

if (!IsEnvironmentLocalhost)
{
    // Get sensitive data from environment variables
    var DB_HOST = Guard.Against.Null(
        Environment.GetEnvironmentVariable("DB_HOST"),
        message: "DB_HOST cannot be null"
    );
    var DB_CREDENTIALS = Guard.Against.Null(
        Environment.GetEnvironmentVariable("DB_CREDENTIALS"),
        message: "DB_CREDENTIALS cannot be null"
    );
    var JWT_SECRET_KEY = Guard.Against.Null(
        Environment.GetEnvironmentVariable("JWT_SECRET_KEY"),
        message: "JWT_SECRET_KEY cannot be null"
    );
    var SMTP_API_KEY = Guard.Against.Null(
        Environment.GetEnvironmentVariable("SMTP_API_KEY"),
        message: "SMTP_API_KEY cannot be null"
    );
    var APP_BASE_URL = Guard.Against.Null(
        Environment.GetEnvironmentVariable("APP_BASE_URL"),
        message: "APP_BASE_URL cannot be null"
    );
    var ADMIN_USER_EMAIL = Guard.Against.Null(
        Environment.GetEnvironmentVariable("ADMIN_USER_EMAIL"),
        message: "ADMIN_USER_EMAIL cannot be null"
    );
    var DEFAULT_TENANT_NAME = Guard.Against.Null(
        Environment.GetEnvironmentVariable("DEFAULT_TENANT_NAME"),
        message: "DEFAULT_TENANT_NAME cannot be null"
    );

    var ON_PREM_TENANT_ID = Guard.Against.Null(
        Environment.GetEnvironmentVariable("ON_PREM_TENANT_ID"),
        message: "ON_PREM_TENANT_ID cannot be null"
    );

    var ON_PREM_INSTANCE_KEY = Guard.Against.Null(
        Environment.GetEnvironmentVariable("ON_PREM_INSTANCE_KEY"),
        message: "ON_PREM_INSTANCE_KEY cannot be null"
    );

    var AZURE_BLOB_STORAGE_CONNECTION_STRING = Guard.Against.Null(
        Environment.GetEnvironmentVariable("AZURE_BLOB_STORAGE_CONNECTION_STRING"),
        message: "AZURE_BLOB_STORAGE_CONNECTION_STRING cannot be null"
    );

    var AZURE_ENTRA_CLIENT_ID = Guard.Against.Null(
        Environment.GetEnvironmentVariable("AZURE_ENTRA_CLIENT_ID"),
        message: "AZURE_ENTRA_CLIENT_ID cannot be null"
    );

    var AZURE_ENTRA_CLIENT_SECRET = Guard.Against.Null(
            Environment.GetEnvironmentVariable("AZURE_ENTRA_CLIENT_SECRET"),
            message: "AZURE_ENTRA_CLIENT_SECRET cannot be null"
        );

    var AZURE_TENANT_ID = Guard.Against.Null(
            Environment.GetEnvironmentVariable("AZURE_TENANT_ID"),
            message: "AZURE_TENANT_ID cannot be null"
        );

    string? RAZORPAY_KEY_ID = string.Empty;
    string? RAZORPAY_KEY_SECRET = string.Empty;
    string? RAZORPAY_WEBHOOK_SECRET = string.Empty;

    // Only load Razorpay credentials if tenant type is 'Commercial'
    if (tenantType == OnPremTenantTypesEnum.Commercial)
    {
        RAZORPAY_KEY_ID = Guard.Against.Null(
            Environment.GetEnvironmentVariable("RAZORPAY_KEY_ID"),
            message: "RAZORPAY_KEY_ID cannot be null"
        );
        RAZORPAY_KEY_SECRET = Guard.Against.Null(
            Environment.GetEnvironmentVariable("RAZORPAY_KEY_SECRET"),
            message: "RAZORPAY_KEY_SECRET cannot be null"
        );
        RAZORPAY_WEBHOOK_SECRET = Guard.Against.Null(
            Environment.GetEnvironmentVariable("RAZORPAY_WEBHOOK_SECRET"),
            message: "RAZORPAY_WEBHOOK_SECRET cannot be null"
        );
    }

    // Update sensitive data in configuration
    config = new ConfigurationBuilder()
        .AddConfiguration(config)
        .AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                { "ConnectionStringConfig:AppDb:Credentials", DB_CREDENTIALS },
                { "ConnectionStringConfig:AppDb:Host", DB_HOST },
                { "ConnectionStringConfig:TenantDb:Credentials", DB_CREDENTIALS },
                { "ConnectionStringConfig:TenantDb:Host", DB_HOST },
                { "JwtConfig:SecretKey", JWT_SECRET_KEY },
                { "SmtpConfig:ApiKey", SMTP_API_KEY },
                { "RazorpayConfig:KeyId", RAZORPAY_KEY_ID },
                { "RazorpayConfig:KeySecret", RAZORPAY_KEY_SECRET },
                { "RazorpayConfig:WebhookSecret", RAZORPAY_WEBHOOK_SECRET },
                { "InstanceConfig:TenantId", ON_PREM_TENANT_ID },
                { "InstanceConfig:InstanceKey", ON_PREM_INSTANCE_KEY },
                { "InstanceConfig:TenantName", DEFAULT_TENANT_NAME },
                { "GeneralConfig:AppDomain", APP_BASE_URL },
                { "DefaultUserConfig:Email", ADMIN_USER_EMAIL },
                { "AzureBlobStorageConfig:ConnectionString", AZURE_BLOB_STORAGE_CONNECTION_STRING },
                { "AzureEntraConfig:ClientId", AZURE_ENTRA_CLIENT_ID },
                { "AzureEntraConfig:ClientSecret", AZURE_ENTRA_CLIENT_SECRET },
                { "AzureEntraConfig:TenantId", AZURE_TENANT_ID },
            }
        )
        .Build();
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
builder.Services.AddIdentityConfig(config); // Note: AddIdentity must come before AddAuthentication
builder.Services.AddAuthenticationConfig(config);

// Database
builder.Services.AddDbContextConfig(config);

// Razorpay client
builder.Services.AddRazorpayClient(config, tenantType);

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
builder.Services.AddQuartzJobs();
builder.Services.AddAzureBlobStorageService(config);
/*--Configure the HTTP request pipeline.--*/

var app = builder.Build();

if (IsEnvironmentLocalhost)
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

if (!IsEnvironmentLocalhost)
    app.UseHsts();

// In a Nginx setup with SSL termination, Nginx handles the HTTPS connection and forwards the request to your backend ASP.NET Core application using HTTP (port 80 by default).
// if (!IsEnvironmentLocalhost) app.UseHttpsRedirection();

app.UseSerilogRequestLogging();

app.UseStaticFiles();

app.UseCookiePolicy();

app.UsePathBase(new PathString("/api"));

app.UseRouting();

app.UseCors("CorsPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.UseRateLimiter();

app.UseMiddleware<TenantRouteAccessMiddleware>();

app.UseMiddleware<SessionValidator>();

app.UseMiddleware<TenantResolver>();

app.MapControllers();

var parameters = Environment.GetCommandLineArgs();

await app.SeedInitialData();

await app.RunAsync();
